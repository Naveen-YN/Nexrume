const vm = require('vm');

const code = `
function test(activeResume, userProfile, localExp, localEdu, localProj, React, bulletsRenderer, renderHeading, renderSection, renderHeader, renderFooter, resName, resTitle, resEmail, resPhone, resLocation, resLinkedin, resGithub, primaryHex, fontSizeStyle, lineHeightStyle) {
  const defaultOrder = activeResume.sectionOrder || ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];
  const isTwoColumn = activeResume.layoutColumns === 'two' || (activeResume.layoutColumns !== 'one' && activeResume.template === 'modern');

  return (
    <div>
      {renderHeader()}
      {isTwoColumn ? (
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-4 flex flex-col gap-3.5 border-r border-zinc-150 pr-4.5 text-left">
            {activeResume.personalPhoto && (
              <div className="w-20 h-20 rounded-xl border border-zinc-200 overflow-hidden mb-2.5 shadow-sm mx-auto">
                <img src={activeResume.personalPhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
            {defaultOrder.filter(s => ['summary', 'skills', 'certifications'].includes(s)).map(s => renderSection(s))}
          </div>
          <div className="col-span-8 flex flex-col gap-3.5 text-left">
            {defaultOrder.filter(s => ['experience', 'education', 'projects'].includes(s)).map(s => renderSection(s))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 text-left">
          {activeResume.personalPhoto && (
            <div className="w-20 h-20 rounded-xl border border-zinc-200 overflow-hidden mb-2.5 shadow-sm">
              <img src={activeResume.personalPhoto} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          {defaultOrder.map(s => renderSection(s))}
        </div>
      )}
      {renderFooter()}
    </div>
  );
}
`;

try {
  new vm.Script(code);
  console.log("Syntax is 100% correct!");
} catch (e) {
  console.error("Syntax Error:", e.message);
}
