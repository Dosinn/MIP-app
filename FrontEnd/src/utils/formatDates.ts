import i18n from 'i18next';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatLesson(dayOfWeek: number, hour: number, endHour?: number) {
    const ref = new Date(2023, 0, 2 + dayOfWeek); // Jan 2 2023 = Monday, so dayOfWeek=0 → Monday (DB convention)
    const locale = i18n.language === "sk" ? "sk-SK" : "en-US";

    const dayName = capitalize(
        new Intl.DateTimeFormat(locale, { weekday: "long" }).format(ref)
    );
    const start = hour.toString().padStart(2, "0") + ":00";
    const end = (endHour ?? (hour + 2)).toString().padStart(2, "0") + ":00";
    const time = `${start} - ${end}`;

    return i18n.t("lesson_at", { day: dayName, time });
}

export function formatCommentDate(isoDate: string) {
    const date = new Date(isoDate);
    const locale = i18n.language === 'sk' ? 'sk-SK' : 'en-US';

    return new Intl.DateTimeFormat(locale,
        { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(date);
}



