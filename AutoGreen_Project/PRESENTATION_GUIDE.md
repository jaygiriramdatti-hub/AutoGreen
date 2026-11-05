# Presentation guide

## Short introduction
My project is AutoGreen, a dashboard for analysing four-wheeler registrations across India. It compares states and monthly patterns using the available 2025 and 2026 records. I used Python to validate and analyse the data, and HTML, CSS and JavaScript to present it in an interactive dashboard.

## Suggested presentation order
1. Problem: a large CSV is difficult to compare manually.
2. Objectives: identify leading states, trends and changes.
3. Dataset: 756 rows, 36 states/UTs, 2025 and Jan–Sep 2026.
4. Cleaning: verify numeric values and keys; preserve five missing counts.
5. Method: descriptive aggregation and matched-period growth.
6. Demo: Overview → Analysis → Compare States → Heatmap → Data Quality.
7. Results: explain the top-state chart and matched growth.
8. Limitations: partial 2026 coverage; registrations are not unique buyers; no company data.
9. Future work: verified five-year manufacturer data, then possible forecasting.
10. Thank you.

## Useful viva questions
**Why did you not replace missing values with zero?**
Missing means unknown. Zero means a reported count of none. Replacing one with the other changes results.

**Why compare January–September in both years?**
Only nine months are available for 2026. Comparing them with a full year can be misleading. The growth calculation further uses only state-month pairs reported in both years.

**Is this machine learning?**
No. The current version is an exploratory data analysis project. Predictive modelling is future work.

**What does the heatmap show?**
The Python heatmap compares each month's count with that state's maximum. It shows timing patterns, not the relative size of different states.

**Why is the percentage increase large for a small territory?**
A small base can produce a large percentage from a small absolute increase. Always check the actual count and coverage.

**How did you test it?**
Independent Python totals, table reconciliation, matched-pair checks, missing-data checks, and dashboard interaction testing.

**Can this identify individual buyers or company sales?**
No. The dataset has aggregate state-month registrations only.
