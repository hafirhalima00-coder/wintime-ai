# lib/analyzer
Static analysis modules:
- structureAnalyzer.ts ÔÇö walks file tree, detects tech stack
- dependencyScanner.ts ÔÇö reads package.json / requirements.txt
- bugDetector.ts ÔÇö grep-based heuristic scanning
- testCoverageChecker.ts ÔÇö maps source files to test files
- reportBuilder.ts ÔÇö assembles final report JSON

Will be populated in Phase 2.
