import React, { useEffect, useRef, useState } from 'react';
import { PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import styles from './index.less';

type Props<T> = { items: T[]; renderItem: (item: T) => React.ReactNode };
export default function RecordCarousel<T>({ items, renderItem }: Props<T>) {
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(motion.matches);
    const visibility = () => setHidden(document.hidden);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    if (viewport.current) observer.observe(viewport.current);
    sync();
    visibility();
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  const visibleCount = width > 700 ? 3 : 1;
  const itemWidth = Math.max(0, (width - (visibleCount - 1) * 24) / visibleCount);
  const scrolling = items.length > 1 && !reduced && width > 0;
  // Each identical group must fill the viewport; short lists repeat without leaving a gap.
  const repeat = items.length ? Math.max(1, Math.ceil((visibleCount + 1) / items.length)) : 1;
  const sequence = Array.from({ length: repeat }, () => items).flat();
  const groupWidth = sequence.length * (itemWidth + 24);
  const playing = !paused && !hovered && !focused && !hidden;
  const trackStyle = {
    '--record-width': `${itemWidth}px`,
    animationDuration: `${groupWidth / 32}s`,
    animationPlayState: playing ? 'running' : 'paused',
  } as React.CSSProperties;

  return (
    <div className={styles.carousel} role="region" aria-label="最近参与记录">
      <div
        ref={viewport}
        className={`${styles.viewport} ${scrolling ? '' : styles.staticViewport}`}
        tabIndex={scrolling || reduced ? 0 : undefined}
        aria-label={scrolling ? '记录连续向左滚动，悬停或聚焦可暂停' : '参与记录列表'}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
      >
        <div className={scrolling ? styles.track : styles.staticTrack} style={trackStyle}>
          {scrolling
            ? [0, 1].map((copy) => (
                <div
                  className={styles.group}
                  key={copy}
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {sequence.map((item, i) => (
                    <div
                      className={styles.item}
                      key={i}
                      aria-hidden={i >= items.length ? true : undefined}
                    >
                      {renderItem(item)}
                    </div>
                  ))}
                </div>
              ))
            : items.map((item, i) => (
                <div className={styles.item} key={i}>
                  {renderItem(item)}
                </div>
              ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className={styles.controls}>
          <span>
            {reduced ? '已按系统设置关闭动画，可横向浏览记录' : '连续播报 · 悬停或聚焦暂停'}
          </span>
          {!reduced && (
            <button type="button"
              aria-label={paused ? '继续记录播报' : '暂停记录播报'}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? <CaretRightOutlined /> : <PauseOutlined />}
              <span>{paused ? '继续播报' : '暂停播报'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
