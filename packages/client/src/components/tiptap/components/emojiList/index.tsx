import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import cls from 'classnames';
import scrollIntoView from 'scroll-into-view-if-needed';
import styles from './index.module.scss';

interface IProps {
  items: Array<{ name: string; emoji: string; fallbackImage?: string }>;
  command: any;
}

export const EmojiList: React.FC<IProps> = forwardRef((props, ref) => {
  const $container = useRef<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useEffect(() => {
    if (Number.isNaN(selectedIndex + 1)) return;
    const el = $container.current.querySelector(`button:nth-of-type(${selectedIndex + 1})`);
    el && scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' });
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className={styles.items}>
      <div ref={$container}>
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={cls(styles.item, index === selectedIndex ? styles['is-selected'] : '')}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.fallbackImage ? <img src={item.fallbackImage} /> : item.emoji}:{item.name}:
            </button>
          ))
        ) : (
          <div className={styles.item}>没有找到结果</div>
        )}
      </div>
    </div>
  );
});
