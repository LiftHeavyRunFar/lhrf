"""Build review PDFs and an evidence archive from the native replay output."""
from pathlib import Path
import importlib.util,json,zipfile
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('native_renderer',ROOT/'scripts/render-scenario-programmes.py')
renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
OUT=ROOT/'output/coaching-v2';PDF=OUT/'pdf';PDF.mkdir(parents=True,exist_ok=True)
REPORT=ROOT/'docs/qa/coaching-v2-final-review.md'
renderer.review(REPORT.read_text(),PDF/'LHRF-coaching-engine-review.pdf')
for group in ['fresh-five','original-three']:
    for file in sorted((ROOT/'docs/qa/coaching-rounds-current'/group).glob('*.json')):
        data=json.loads(file.read_text())
        if 'programme' not in data:continue
        renderer.programme(data['programme'],data['source'],PDF/(data['id']+'-engine-programme.pdf'))
archive=OUT/'LHRF-coaching-engine-tested-programmes.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('README.txt','Reviewed candidate coaching policy, version 2.\n\nAll prescriptions are untouched shared-engine outputs. Review PDFs expand the first four weeks, event weeks, priority handovers and the peak long-run week; JSON retains the complete horizon.\n\nTraining readiness is conditional on the input reviews in Priya\'s report. Original-profile comparison assumptions are not verified athlete facts. No approved programme, log or deployment was changed.\n\nReproduce in LiftHeavyRunFar/lhrf using npm test and npm run test:coaching:rounds.\n')
    for f in sorted(PDF.glob('*.pdf')):z.write(f,'PDFs/'+f.name)
    for f in sorted((ROOT/'docs/qa/coaching-rounds-current').rglob('*.json')):z.write(f,'native-output/'+str(f.relative_to(ROOT/'docs/qa/coaching-rounds-current')))
    for f in [REPORT,ROOT/'docs/qa/original-three-comparison-baseline.json',ROOT/'docs/qa/original-three-native-comparison.json']:
        if f.exists():z.write(f,'review/'+f.name)
    for f in ['five-scenario-engine-inputs.json','five-scenario-round-two-inputs.json','original-three-engine-inputs.json']:z.write(ROOT/'tests/fixtures'/f,'inputs/'+f)
    baseline=ROOT.parent/'engine-rounds/baseline-v1'
    if baseline.exists():
        for f in sorted(baseline.glob('*.json')):z.write(f,'preserved-before-fixes/'+f.name)
print(json.dumps({'pdfs':[str(p)for p in sorted(PDF.glob('*.pdf'))],'archive':str(archive)},indent=2))
