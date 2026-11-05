"""Run: python -m unittest -v"""
import unittest
import pandas as pd
from analysis import load_data, build_tables

class AnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.df=load_data();cls.t=build_tables(cls.df)
    def test_source_coverage(self):
        self.assertEqual(len(self.df),756)
        self.assertEqual(self.df.state_ut.nunique(),36)
        self.assertEqual(self.df[self.df.year.eq(2026)].month.max(),9)
    def test_missing_not_zero(self):
        self.assertEqual(self.df.registrations.isna().sum(),5)
        self.assertTrue(pd.isna(self.df.query("state_ut == 'Lakshadweep' and year == 2026 and month == 7").iloc[0].registrations))
    def test_totals_reconcile(self):
        self.assertEqual(int(self.t['annual'].loc[2025,'total']),4646012)
        self.assertEqual(int(self.t['annual'].loc[2026,'total']),3985145)
        for year in [2025,2026]:self.assertEqual(int(self.t['states'][year].sum()),int(self.t['monthly'][year].sum()))
    def test_matched_comparison(self):
        self.assertEqual(len(self.t['pairs']),321)
        self.assertFalse(self.t['pairs'][['prior','current']].isna().any().any())
        p=self.t['pairs'];self.assertAlmostEqual((int(p.current.sum())/int(p.prior.sum())-1)*100,23.4701474618,places=8)
    def test_missing_future(self):
        self.assertTrue(self.t['monthly'].loc[10:12,2026].isna().all())
    def test_small_state_pairs(self):
        self.assertEqual(self.t['growth'].loc['Lakshadweep','matched_months'],6)

if __name__=='__main__':unittest.main()
