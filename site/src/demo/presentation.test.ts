import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Landing from '../pages/Landing';
import Demo from '../pages/Demo';
import { storySteps } from './story';
import { initialState, reducer, storageKey, stageState, type DemoState } from './reducer';

function render(location: string, state: DemoState = initialState, savedReview?: DemoState) {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>JSON.stringify(key===storageKey?state:savedReview??null)}});
  try { return renderToStaticMarkup(createElement(StaticRouter,{location},createElement(location==='/'?Landing:Demo))); }
  finally { Reflect.deleteProperty(globalThis,'localStorage'); }
}
test('all seven stages can be viewed directly without previous interaction',()=>{
  for (const step of storySteps) {
    const html = render('/demo/'+step.key);
    assert.ok(html.includes(step.title),step.key);
    assert.ok(html.includes(step.task),step.key);
    assert.ok(!html.includes('请先') && !html.includes('先完成活动结算'),step.key);
    assert.ok(!html.includes('固定案例最终结果'),step.key);
    assert.ok(!html.includes('screenshots/'),step.key);
  }
  const home=render('/');
  assert.ok(home.includes('银行权益'));
  assert.ok(home.includes('¥6,000'));
  assert.ok(!home.includes('149.3%'));
  assert.ok(!home.includes('screenshots/'));
});
test('completed case retains single-customer budget on wallet revisit and saves the full-case decision',()=>{
  let state={...initialState};
  for(const type of ['submit','approve','publish','claim','redeem','end','settle'] as const) state=reducer(state,{type});
  const wallet=render('/demo/wallet?mode=flow',state);
  assert.ok(wallet.includes('¥5,988'));
  assert.ok(!wallet.includes('¥3,300'));
  state=reducer(state,{type:'decision',value:'保持',reason:'先调查商户的使用门槛'});
  const review=render('/demo/final-review?mode=flow',state);
  assert.ok(review.includes('先调查商户的使用门槛'));
  assert.ok(review.includes('¥3,300'));
  assert.ok(review.includes('¥2,700'));
  assert.ok(render('/demo/final-review',initialState,state).includes('先调查商户的使用门槛'));
});
test('full flow keeps prerequisites and checks remain pending before redemption',()=>{
  assert.ok(render('/demo/wallet?mode=flow').includes('活动发布后，客户才能领券'));
  assert.ok(render('/demo/redemption?mode=flow').includes('请先领取优惠券'));
  const pending=render('/demo/redemption');
  assert.ok(pending.includes('○ 绑定商户一致'));
  assert.ok(!pending.includes('预留 −'));
  const done=reducer(stageState('redemption'),{type:'redeem'});
  const completed=render('/demo/redemption?mode=flow',done);
  assert.ok(completed.includes('✓ 绑定商户一致'));
  assert.ok(completed.includes('预留 −'));
});
