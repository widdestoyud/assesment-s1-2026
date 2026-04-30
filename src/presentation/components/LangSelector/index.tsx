import clsx from 'classnames';
import { FC } from 'react';
import styles from './lang-selector.module.scss';

export interface LangSelector {
  language: LangData[];
  onChangeLng?: (lang: string) => void;
}

export interface LangData {
  img: string;
  name: string;
  active?: boolean;
}

const LangSelector: FC<LangSelector> = ({ language, onChangeLng }) => {
  if (!language.length) {
    return null;
  }
  return (
    <div className={styles.langContainer}>
      {language.map((lang, index, array) => (
        <div className={styles.lngButtonContainer} key={lang.name}>
          <button
            onClick={() => onChangeLng?.(lang.name)}
            className={clsx([styles.buttonLang], {
              [styles.active]: lang.active,
            })}
          >
            <img src={lang.img} className="h-4" alt={lang.name} />
            {lang.name}
          </button>
          {index !== array.length - 1 && <div className={styles.divider} />}
        </div>
      ))}
    </div>
  );
};

export default LangSelector;
