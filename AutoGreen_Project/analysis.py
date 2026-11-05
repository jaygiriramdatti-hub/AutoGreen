"""Reproducible exploratory analysis. Run: python analysis.py"""
from pathlib import Path
import json
import numpy as np
import pandas as pd
import matplotlib
if __name__ == '__main__':
    matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
GREEN = '#168253'

def load_data(path=ROOT / 'data/registrations.csv'):
    df = pd.read_csv(path, encoding='utf-8-sig')
    required = {'state_ut','year','month','registrations','data_status'}
    if not required.issubset(df.columns):
        raise ValueError(f'Missing columns: {required - set(df.columns)}')
    for col in ['year','month','registrations']:
        df[col] = pd.to_numeric(df[col], errors='raise')
    if df[['state_ut','year','month']].isna().any().any():
        raise ValueError('Missing state or date key')
    if df.duplicated(['state_ut','year','month']).any():
        raise ValueError('Duplicate state-month keys: resolve before aggregation')
    if not df.month.between(1,12).all() or (df.month % 1 != 0).any():
        raise ValueError('Invalid month')
    values = df.registrations.dropna()
    if (values < 0).any() or (values % 1 != 0).any():
        raise ValueError('Counts must be nonnegative integers')
    df['registrations'] = df.registrations.astype('Int64')
    df['date'] = pd.to_datetime(dict(year=df.year, month=df.month, day=1))
    return df.sort_values(['state_ut','date']).reset_index(drop=True)

def matched_pairs(df):
    prior = df[df.year.eq(2025)][['state_ut','month','registrations']].rename(columns={'registrations':'prior'})
    current = df[df.year.eq(2026)][['state_ut','month','registrations']].rename(columns={'registrations':'current'})
    pairs = prior.merge(current, on=['state_ut','month'], validate='one_to_one').dropna(subset=['prior','current'])
    return pairs

def build_tables(df):
    pairs = matched_pairs(df)
    matched = pairs.groupby('state_ut')[['prior','current']].sum()
    matched['matched_months'] = pairs.groupby('state_ut').size()
    matched['growth_percent'] = (matched.current - matched.prior).div(matched.prior.replace(0,np.nan)) * 100
    monthly = df.groupby(['year','month']).registrations.sum(min_count=1).unstack('year').reindex(range(1,13))
    states = df.groupby(['state_ut','year']).registrations.sum(min_count=1).unstack('year')
    annual = df.groupby('year').agg(reported_records=('registrations','count'),expected_records=('registrations','size'))
    annual['total'] = df.groupby('year').registrations.sum(min_count=1)
    common = df[df.month.le(9)].groupby('year').registrations.sum(min_count=1)
    return dict(pairs=pairs, growth=matched, monthly=monthly, states=states, annual=annual, common=common)

def save_charts(df, tables, out):
    plt.rcParams.update({'font.family':'DejaVu Sans','axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold','axes.labelcolor':'#35513e','figure.facecolor':'white','axes.facecolor':'white'})
    def finish(fig, name):
        fig.tight_layout(); fig.savefig(out / name,dpi=150,bbox_inches='tight'); plt.close(fig)
    fig,ax=plt.subplots(figsize=(10,4.8))
    for year,color in [(2025,'#93ae70'),(2026,GREEN)]:
        ax.plot(range(1,13),tables['monthly'][year].astype(float)/1000,marker='o',label=str(year),color=color)
    ax.set(title='Monthly four-wheeler registrations',xlabel='Month',ylabel='Reported registrations (thousands)',xticks=range(1,13))
    ax.legend();ax.grid(axis='y',alpha=.2);finish(fig,'01_monthly_trend.png')
    fig,ax=plt.subplots(figsize=(10,6))
    top=tables['states'][2026].nlargest(10).sort_values()
    ax.barh(top.index,top.astype(float)/1000,color=GREEN)
    ax.set(title='Top 10 states / UTs — Jan–Sep 2026',xlabel='Reported registrations (thousands)')
    finish(fig,'02_top_states.png')
    fig,ax=plt.subplots(figsize=(8,4.5))
    ax.bar(['2025 Jan–Sep','2026 Jan–Sep'],tables['common'].astype(float)/1e6,color=['#93ae70',GREEN])
    ax.set(title='Same calendar months: January–September',ylabel='Reported registrations (millions)')
    for i,v in enumerate(tables['common']):ax.text(i,float(v)/1e6,format(int(v),','),ha='center',va='bottom')
    ax.margins(y=.18);finish(fig,'03_same_period.png')
    heat=df[df.year.eq(2026)].pivot(index='state_ut',columns='month',values='registrations').reindex(columns=range(1,10)).astype(float)
    relative=heat.div(heat.max(axis=1).replace(0,np.nan),axis=0)
    fig,ax=plt.subplots(figsize=(10,12));cmap=plt.colormaps['Greens'].copy();cmap.set_bad('#e9d9b0')
    im=ax.imshow(relative.to_numpy(),aspect='auto',cmap=cmap,vmin=0,vmax=1)
    ax.set(yticks=range(len(heat)),yticklabels=heat.index,xticks=range(9),xticklabels=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],title='2026 monthly pattern within each state')
    ax.tick_params(axis='y',labelsize=8);fig.colorbar(im,ax=ax,label="Fraction of that state's highest month")
    fig.text(.01,.005,'Beige = missing. Colours show timing within states, not differences in state size.',fontsize=9)
    finish(fig,'04_heatmap.png')

def run():
    out=ROOT/'outputs';out.mkdir(exist_ok=True)
    df=load_data();t=build_tables(df)
    df.to_csv(out/'cleaned_registrations.csv',index=False)
    for name in ['growth','monthly','states','annual']:
        t[name].to_csv(out/f'{name}.csv')
    df[df.registrations.isna()].to_csv(out/'missing_records.csv',index=False)
    p=t['pairs'];growth=(int(p.current.sum())/int(p.prior.sum())-1)*100
    summary={'rows':len(df),'states':df.state_ut.nunique(),'missing':int(df.registrations.isna().sum()),'completeness_percent':float(df.registrations.notna().mean()*100),'matched_pairs':len(p),'matched_growth_percent':growth,'matched_2025':int(p.prior.sum()),'matched_2026':int(p.current.sum()),'total_2025':int(t['annual'].loc[2025,'total']),'total_2026':int(t['annual'].loc[2026,'total'])}
    (out/'summary.json').write_text(json.dumps(summary,indent=2))
    save_charts(df,t,out)
    print(json.dumps(summary,indent=2));return df,t,summary

if __name__=='__main__':run()
