import dotenv from 'dotenv';
dotenv.config();

export const HA = {
    BASE_URL: process.env.HA_URL,
    TOKEN: process.env.HA_TOKEN
};

export const NTFY = {
    BASE_URL: process.env.NTFY_URL,
    TOKEN: process.env.NTFY_TOKEN
};

export const ENTITIES = {
    AC_TOGGLE: 'input_boolean.toggle_status_main_bedroom_portable_ac',
    AC_OVERRIDE: 'input_boolean.toggle_status_portable_ac_override',
    AC_SWITCH: 'switch.outlet_main_bedroom_portable_ac'
};

export const SCHEDULE = {
    AC_ON_HOUR: 19,
    AC_OFF_HOUR_WEEKDAY: 8,
    AC_OFF_HOUR_WEEKEND: 9
};
