'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/student/Navbar';
import { useLanguage, languages } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const [selectedLang, setSelectedLang] = useState(language);
    const [showSuccess, setShowSuccess] = useState(false);
    const [animatingLang, setAnimatingLang] = useState<string | null>(null);

    useEffect(() => {
        setSelectedLang(language);
    }, [language]);

    const handleLanguageSelect = (langCode: string) => {
        setAnimatingLang(langCode);
        setTimeout(() => {
            setSelectedLang(langCode);
            setLanguage(langCode);
            setAnimatingLang(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 300);
    };

    const getLangInfo = (code: string) => languages.find(l => l.code === code);

    return (
        <div className={styles.settings}>
            <Navbar />

            {/* Success Toast */}
            {showSuccess && (
                <div className={styles.successToast}>
                    <span className={styles.toastIcon}>✓</span>
                    {t('languageSaved')}
                </div>
            )}

            <div className={styles.mainContainer}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>⚙️ {t('settings')}</h1>
                    <p className={styles.pageDesc}>{t('settingsDesc')}</p>
                </div>

                {/* Language Selection - Featured Section */}
                <div className={styles.languageSection}>
                    <div className={styles.languageHeader}>
                        <div className={styles.languageIcon}>🌐</div>
                        <div>
                            <h2>{t('languageRegion')}</h2>
                            <p>{t('selectLanguage')}</p>
                        </div>
                    </div>

                    {/* Current Language Display */}
                    <div className={styles.currentLangDisplay}>
                        <span className={styles.currentLabel}>Current:</span>
                        <div
                            className={styles.currentLangBadge}
                            style={{ borderColor: getLangInfo(selectedLang)?.color }}
                        >
                            <span
                                className={styles.currentLangIcon}
                                style={{
                                    background: `linear-gradient(135deg, ${getLangInfo(selectedLang)?.color}20, ${getLangInfo(selectedLang)?.color}40)`,
                                    color: getLangInfo(selectedLang)?.color
                                }}
                            >
                                {getLangInfo(selectedLang)?.icon}
                            </span>
                            <span className={styles.currentLangName}>
                                {getLangInfo(selectedLang)?.nativeName}
                            </span>
                        </div>
                    </div>

                    {/* Language Grid */}
                    <div className={styles.languageGrid}>
                        {languages.map((lang, index) => (
                            <button
                                key={lang.code}
                                className={`${styles.languageCard} ${selectedLang === lang.code ? styles.selected : ''} ${animatingLang === lang.code ? styles.animating : ''}`}
                                onClick={() => handleLanguageSelect(lang.code)}
                                style={{
                                    '--lang-color': lang.color,
                                    '--delay': `${index * 0.05}s`
                                } as React.CSSProperties}
                            >
                                <div
                                    className={styles.langCircle}
                                    style={{ borderColor: lang.color }}
                                >
                                    <span
                                        className={styles.langIcon}
                                        style={{ color: lang.color }}
                                    >
                                        {lang.icon}
                                    </span>
                                    {selectedLang === lang.code && (
                                        <div className={styles.checkMark}>✓</div>
                                    )}
                                </div>
                                <span className={styles.langNative}>{lang.nativeName}</span>
                                <span className={styles.langEnglish}>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.settingsGrid}>
                    {/* Appearance */}
                    <div className={styles.settingsCard}>
                        <h2>🎨 {t('appearance')}</h2>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('theme')}</span>
                                <span className={styles.settingDesc}>{t('themeDesc')}</span>
                            </div>
                            <select className={styles.settingSelect}>
                                <option>{t('light')}</option>
                                <option>{t('dark')}</option>
                                <option>{t('system')}</option>
                            </select>
                        </div>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('fontSize')}</span>
                                <span className={styles.settingDesc}>{t('fontSizeDesc')}</span>
                            </div>
                            <select className={styles.settingSelect}>
                                <option>{t('small')}</option>
                                <option>{t('medium')}</option>
                                <option>{t('large')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className={styles.settingsCard}>
                        <h2>🔔 {t('notifications')}</h2>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('pushNotifications')}</span>
                                <span className={styles.settingDesc}>{t('pushNotificationsDesc')}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('emailNotifications')}</span>
                                <span className={styles.settingDesc}>{t('emailNotificationsDesc')}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('assignmentReminders')}</span>
                                <span className={styles.settingDesc}>{t('assignmentRemindersDesc')}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" defaultChecked />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className={styles.settingsCard}>
                        <h2>🔒 {t('privacy')}</h2>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('profileVisibility')}</span>
                                <span className={styles.settingDesc}>{t('profileVisibilityDesc')}</span>
                            </div>
                            <select className={styles.settingSelect}>
                                <option>{t('everyone')}</option>
                                <option>{t('classmatesOnly')}</option>
                                <option>{t('teachersOnly')}</option>
                                <option>{t('private')}</option>
                            </select>
                        </div>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('showProgress')}</span>
                                <span className={styles.settingDesc}>{t('showProgressDesc')}</span>
                            </div>
                            <label className={styles.toggle}>
                                <input type="checkbox" />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {/* Time Zone */}
                    <div className={styles.settingsCard}>
                        <h2>🕐 {t('timeZone')}</h2>
                        <div className={styles.settingItem}>
                            <div className={styles.settingInfo}>
                                <span className={styles.settingLabel}>{t('timeZone')}</span>
                                <span className={styles.settingDesc}>{t('timeZoneDesc')}</span>
                            </div>
                            <select className={styles.settingSelect}>
                                <option>IST (UTC+5:30)</option>
                                <option>UTC</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button className={styles.saveBtn}>
                    💾 {t('saveChanges')}
                </button>
            </div>
        </div>
    );
}
