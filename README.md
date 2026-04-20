\## 🎨 Terminal UI (TUI)

This tool leverages modern terminal styling to provide a web-page-like experience natively in your command line, utilizing purely TypeScript.



\*\*Under the hood, it uses:\*\*

\* `cli-table3`: For drawing responsive, structured grids (similar to HTML tables).

\* `chalk`: For rich typography, text coloring, and background styling (similar to CSS).

\* `ora`: For dynamic loading states and transitions.



\### Example Output

```text

╔══════════════════════════════════════════════════╤════════════════════╗

║ Test Name                                        │ Status             ║

╟──────────────────────────────────────────────────┼────────────────────╢

║ test\_user\_authentication                         │ ✅ OK              ║

╟──────────────────────────────────────────────────┼────────────────────╢

║ test\_payment\_gateway\_timeout                     │ ❌ NOT OK          ║

╟──────────────────────────────────────────────────┼────────────────────╢

║ test\_database\_connection                         │ ✅ OK              ║

╚══════════════════════════════════════════════════╧════════════════════╝

&#x20;SUMMARY  2 Passed | 1 Failed | Total: 3

