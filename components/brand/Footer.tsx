import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function Footer() {
  const t = await getTranslations('footer');
  return (
    <footer className="foot">
      <div className="container-x">
        <div className="foot-big">
          {t('intro').includes('You') ? (
            <>
              Black. White. <em>You.</em>
            </>
          ) : (
            <>{t('intro')}</>
          )}
        </div>
        <div className="foot-meta">
          <div>
            {t('intro')}
            <br />
            {t('subtitle')}
          </div>
          <div>
            {t('version')} ·{' '}
            <Link href="/stylelab" style={{ textDecoration: 'underline' }}>
              {t('try')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
