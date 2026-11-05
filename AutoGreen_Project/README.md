# AutoGreen: Indian Automobile Data Analysis
**A data analysis mini project by Jay Ramdatti**

Start with `START_HERE.html` for a plain-language project report. It contains results and charts and opens directly in a browser.

## What is included
- `dashboard/`: complete white and green interactive website, including Analysis studio, comparisons, heatmap and data explorer.
- `notebooks/AutoGreen_Analysis.ipynb`: worked notebook with saved results and charts.
- `analysis.py`: reproducible Python cleaning, validation, aggregation and chart generation.
- `data/registrations.csv`: original input, unchanged.
- `outputs/`: cleaned data, summary tables, missing-record audit, four PNG charts and summary JSON.
- `test_analysis.py`: six regression checks.
- `PRESENTATION_GUIDE.md`: project explanation and viva preparation.
- `requirements.txt`: core analysis dependencies.

## Run the dashboard (no packages required)
Open a terminal inside the extracted `AutoGreen_Project` folder:

```bash
python -m http.server 8000 --directory dashboard
```
Open http://localhost:8000. On Windows, use `py` instead of `python` if needed. You can also open `dashboard/index.html` with VS Code Live Server. Do not double-click that HTML file: fetching JSON requires an HTTP server.

## Run the Python project
Python 3.10 or later is recommended.

```bash
python -m pip install -r requirements.txt
python analysis.py
python -m unittest -v
```
The analysis rewrites derived files in `outputs/`. The original CSV stays unchanged. Existing output files are included, so you can inspect results without running Python.

## Open the notebook
Use VS Code with the Python and Jupyter extensions, or install Jupyter:

```bash
python -m pip install notebook
python -m notebook
```
Open `notebooks/AutoGreen_Analysis.ipynb`. Select a Python environment with the requirements installed, then Run All. Keep the original directory structure. The notebook detects the project root from either the project folder or `notebooks/`.

## Questions answered
1. Which states have the highest reported registrations?
2. How do monthly and quarterly registration patterns change?
3. How does January–September 2026 compare with the same months in 2025?
4. Where are data missing, and how do those gaps affect comparisons?

## Data scope and honesty
This is descriptive analysis, not a trained machine-learning system. The dataset contains 756 state-month rows covering 36 states/UTs, January–December 2025 and January–September 2026. Five counts are missing. Counts represent the source's Four Wheeler category, not verified car-only sales or unique buyers. Source metadata cites https://www.tamilnadudata.org/vehicles/states/ with download date 16 October 2026. Source figures have not been independently verified. No company, model, price, fuel, segment or individual-buyer fields are present.

Annual 2025 and 2026 totals have unequal coverage. Growth uses only state-month pairs reported in both years, excludes missing values, and is unavailable when the prior total is zero. Missing future months are never filled with zeros. The heatmap is normalized within each state for timing comparisons.

The website is an included snapshot of the tested v3 dashboard. Its calculations run in JavaScript. The Python pipeline independently reproduces the analysis; it is not a server backend. For future data updates, update the pipeline and dashboard coverage logic together; do not simply append new years.

## Roadmap
Completed: problem definition, source inspection, cleaning, EDA, visualizations, dashboard, calculations, checks and documentation.
Future: acquire consistent monthly manufacturer/state data for five years; document company-name mappings; add company comparison. Consider forecasting only with sufficient history, a chronological holdout and a simple baseline. No predictions have been fabricated.
