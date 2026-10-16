import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Landing from '../pages/Landing';
import Demo from '../pages/Demo';
import { storySteps } from './story';
import { initialState, reducer, type DemoState } from './reducer';

function render(location: string, state: DemoState = initialState) {
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>JSON.stringify(state)}});
  try { return renderToStaticMarkup(createElement(StaticRouter,{location},createElement(location==='/'?Landing:Demo))); }
  finally { Reflect.deleteProperty(globalThis,'localStorage'); }
}
test('all seven pages render their task and result without requiring previous interaction',()=>{
  for (const step of storySteps) {
    const html = render('/demo/'+step.key);
    assert.ok(html.includes(step.title),step.key);
    assert.ok(html.includes(step.task),step.key);
    assert.ok(html.includes(step.result),step.key);
    assert.ok(!html.includes('screenshots/'),step.key);
  }
  const home=render('/');
  assert.ok(home.includes('渝惠帮助经营人员选客户'));
  assert.ok(home.includes('¥6,000.00'));
  assert.ok(!home.includes('screenshots/'));
});
test('completed case retains single-customer budget on wallet revisit and saves the full-case decision',()=>{
  let state={...initialState};
  for(const type of ['submit','approve','publish','claim','redeem','end','settle'] as const) state=reducer(state,{type});
  const wallet=render('/demo/wallet',state);
  assert.ok(wallet.includes('¥5,988.00'));
  assert.ok(!wallet.includes('¥3,300.00'));
  state=reducer(state,{type:'decision',value:'保持',reason:'先调查商户的使用门槛'});
  const review=render('/demo/final-review',state);
  assert.ok(review.includes('先调查商户的使用门槛'));
  assert.ok(review.includes('¥3,300.00'));
  assert.ok(review.includes('¥2,700.00'));
});
