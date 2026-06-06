import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getOAuthClient } from '../../../../lib/google';
import { google } from 'googleapis';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('nexrume-session');

  if (!sessionCookie) {
    return NextResponse.json({ error: 'unauthorized', message: 'No active session cookie found.' }, { status: 401 });
  }

  try {
    const session = jwt.verify(sessionCookie.value, JWT_SECRET) as any;
    const tokens = session.tokens;

    if (!tokens || !tokens.access_token) {
      return NextResponse.json({ error: 'unauthorized', message: 'No Google OAuth tokens found in session. Please log in with Google.' }, { status: 401 });
    }

    const { applications, spreadsheetId, tabName } = await req.json();

    const oauth2Client = getOAuthClient(tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    let activeSpreadsheetId = spreadsheetId ? spreadsheetId.trim() : '';
    
    // Parse Google Sheet ID if a full URL was provided
    if (activeSpreadsheetId.includes('docs.google.com')) {
      const match = activeSpreadsheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        activeSpreadsheetId = match[1];
      }
    }

    // 1. Create a spreadsheet dynamically if one does not exist or was left blank
    if (!activeSpreadsheetId) {
      const resource = {
        properties: {
          title: 'Nexrume Job Tracker',
        },
      };
      const sheetResponse = await sheets.spreadsheets.create({
        requestBody: resource,
        fields: 'spreadsheetId',
      });
      activeSpreadsheetId = sheetResponse.data.spreadsheetId;
    }

    const activeTabName = tabName || 'Sheet1';

    // 2. Verify spreadsheet exists and check/create the active tab name
    let sheetId = 0;
    try {
      const spreadsheetMeta = await sheets.spreadsheets.get({
        spreadsheetId: activeSpreadsheetId,
      });
      const activeSheet = spreadsheetMeta.data.sheets?.find(
        (s) => s.properties?.title === activeTabName
      );

      if (!activeSheet) {
        const batchRes = await sheets.spreadsheets.batchUpdate({
          spreadsheetId: activeSpreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: activeTabName,
                  },
                },
              },
            ],
          },
        });
        const addedSheetProperties = batchRes.data.replies?.[0]?.addSheet?.properties;
        sheetId = addedSheetProperties?.sheetId || 0;
      } else {
        sheetId = activeSheet.properties?.sheetId || 0;
      }
    } catch (e: any) {
      if (e.status === 404 || e.message?.toLowerCase().includes('not found') || e.message?.includes('Requested entity was not found')) {
        throw new Error(`The spreadsheet ID or URL was not found. Please verify the ID exists and your Google Account has access to it, or leave it blank to auto-create a new one.`);
      }
      console.warn("Non-fatal sheet meta verification warning:", e.message);
    }

    // 3. Clear sheet if no applications exist, otherwise format entries into rows
    if (!applications || applications.length === 0) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: activeSpreadsheetId,
        range: `${activeTabName}!A:Z`,
      });
      return NextResponse.json({
        success: true,
        spreadsheetId: activeSpreadsheetId,
        message: `Spreadsheet cleared: 0 applications synced.`,
      });
    }

    const headers = ['Company', 'Role', 'Location', 'Salary', 'Currency', 'Priority', 'Work Mode', 'Status', 'Applied Date', 'Rounds', 'Resume File'];
    
    const truncateCell = (val: string) => {
      if (!val) return '';
      if (val.length > 49000) {
        return val.substring(0, 49000) + '... (truncated)';
      }
      return val;
    };

    const ZINC_950 = { red: 0.035, green: 0.035, blue: 0.043 }; // Header bg
    const ZINC_900 = { red: 0.094, green: 0.094, blue: 0.106 }; // Even rows bg
    const ZINC_850 = { red: 0.149, green: 0.149, blue: 0.161 }; // Odd rows bg
    const WHITE = { red: 1.0, green: 1.0, blue: 1.0 };
    const ZINC_200 = { red: 0.894, green: 0.894, blue: 0.906 };

    // Status text colors
    const STATUS_COLORS: Record<string, any> = {
      Applied: { red: 0.235, green: 0.470, blue: 0.941 }, // blue-400
      OA: { red: 0.639, green: 0.360, blue: 0.909 }, // purple-400
      Assessment: { red: 0.639, green: 0.360, blue: 0.909 },
      Interview: { red: 0.956, green: 0.643, blue: 0.376 }, // amber-400
      Offer: { red: 0.301, green: 0.776, blue: 0.403 }, // emerald-400
      Shortlisted: { red: 0.301, green: 0.776, blue: 0.403 },
      Rejected: { red: 0.937, green: 0.325, blue: 0.313 }, // rose-400
      Ghosted: { red: 0.5, green: 0.5, blue: 0.5 }, // gray
      Withdrawn: { red: 0.5, green: 0.5, blue: 0.5 },
      Wishlist: { red: 0.309, green: 0.662, blue: 0.866 }, // sky-400
      Saved: { red: 0.309, green: 0.662, blue: 0.866 }
    };

    // Priority colors
    const PRIORITY_COLORS: Record<string, any> = {
      Critical: { red: 0.937, green: 0.325, blue: 0.313 }, // rose-400
      High: { red: 0.956, green: 0.643, blue: 0.376 }, // amber-400
      Medium: { red: 0.235, green: 0.470, blue: 0.941 }, // blue-400
      Low: { red: 0.5, green: 0.5, blue: 0.5 } // gray
    };

    const rowDataList: any[] = [];

    // Add headers row
    const headerRow = {
      values: headers.map((h) => ({
        userEnteredValue: { stringValue: h },
        userEnteredFormat: {
          backgroundColor: ZINC_950,
          textFormat: {
            foregroundColor: WHITE,
            bold: true,
            fontSize: 11,
            fontFamily: 'Roboto'
          },
          verticalAlignment: 'MIDDLE',
          horizontalAlignment: 'CENTER',
          padding: { top: 8, bottom: 8, left: 10, right: 10 }
        }
      }))
    };
    rowDataList.push(headerRow);

    // Add applications rows
    applications.forEach((app: any, idx: number) => {
      let resumeValue = app.resumeFile || app.resumeUsed || '';
      if (resumeValue.startsWith('data:')) {
        const mimeType = resumeValue.match(/^data:(.+?);base64/)?.[1] || 'document';
        resumeValue = `[Embedded Base64 ${mimeType}] (Local Preview Only)`;
      }

      // Alternate background for zebra striping
      const rowBg = idx % 2 === 0 ? ZINC_900 : ZINC_850;

      const appData = [
        app.company || '',
        app.role || '',
        app.location || '',
        app.salary ? String(app.salary) : '0',
        app.currency || 'USD',
        app.priority || 'Low',
        app.workMode || 'Remote',
        app.status || 'Wishlist',
        app.appliedDate || '',
        app.totalRounds ? `${app.currentRound || 1}/${app.totalRounds}` : '',
        resumeValue
      ];

      const rowValues = appData.map((val, colIdx) => {
        const cellData: any = {
          userEnteredValue: { stringValue: truncateCell(val) },
          userEnteredFormat: {
            backgroundColor: rowBg,
            textFormat: {
              foregroundColor: ZINC_200,
              fontSize: 10,
              fontFamily: 'Roboto'
            },
            verticalAlignment: 'MIDDLE',
            padding: { top: 6, bottom: 6, left: 8, right: 8 }
          }
        };

        // Align number values to the right or center (e.g. Salary, Currency, Applied Date, Rounds)
        if (colIdx === 3) { // Salary
          cellData.userEnteredFormat.horizontalAlignment = 'RIGHT';
          cellData.userEnteredValue = { numberValue: Number(val) || 0 };
        } else if (colIdx === 4 || colIdx === 8 || colIdx === 9) { // Currency, Date, Rounds
          cellData.userEnteredFormat.horizontalAlignment = 'CENTER';
        }

        // Apply specific color styling for Status (colIdx 7)
        if (colIdx === 7) {
          const status = val;
          const statusColor = STATUS_COLORS[status] || ZINC_200;
          cellData.userEnteredFormat.textFormat.foregroundColor = statusColor;
          cellData.userEnteredFormat.textFormat.bold = true;
          cellData.userEnteredFormat.horizontalAlignment = 'CENTER';
        }

        // Apply specific color styling for Priority (colIdx 5)
        if (colIdx === 5) {
          const priority = val;
          const priorityColor = PRIORITY_COLORS[priority] || ZINC_200;
          cellData.userEnteredFormat.textFormat.foregroundColor = priorityColor;
          cellData.userEnteredFormat.textFormat.bold = true;
          cellData.userEnteredFormat.horizontalAlignment = 'CENTER';
        }

        return cellData;
      });

      rowDataList.push({ values: rowValues });
    });

    // Clear all existing sheet values before doing batchUpdate to ensure no stale data remains at the bottom
    await sheets.spreadsheets.values.clear({
      spreadsheetId: activeSpreadsheetId,
      range: `${activeTabName}!A:Z`,
    });

    // Write styled grid and format using batchUpdate
    const requests = [
      // 1. Reset cell background/text formats to the dark theme for rows 0 to 100
      {
        repeatCell: {
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            endRowIndex: 100,
            startColumnIndex: 0,
            endColumnIndex: 11
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: ZINC_900,
              textFormat: {
                foregroundColor: ZINC_200,
                fontSize: 10,
                fontFamily: 'Roboto'
              }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      },
      // 2. Write values and custom layouts/colors for data rows
      {
        updateCells: {
          rows: rowDataList,
          fields: 'userEnteredValue,userEnteredFormat',
          range: {
            sheetId: sheetId,
            startRowIndex: 0,
            startColumnIndex: 0
          }
        }
      },
      // 3. Auto-fit column widths
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 11
          }
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: activeSpreadsheetId,
      requestBody: {
        requests
      }
    });

    return NextResponse.json({
      success: true,
      spreadsheetId: activeSpreadsheetId,
      message: `Successfully synchronized ${applications.length} applications to Google Sheets with dark theme styling.`,
    });
  } catch (error: any) {
    console.error("Error syncing with Google Sheets API:", error);
    return NextResponse.json({
      error: 'api_failed',
      message: error.message || 'Failed to update Google Sheets cells.',
    }, { status: 500 });
  }
}
