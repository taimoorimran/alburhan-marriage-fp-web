export const FETCH_SYSTEM_SETTING_SUCCESS = 'FETCH_SYSTEM_SETTING_SUCCESS';
export const FETCH_SYSTEM_SETTING_FAILURE = 'FETCH_SYSTEM_SETTING_FAILURE';
export const fetchSystemSetttingsSuccess = systemSetttings => ({
  type: FETCH_SYSTEM_SETTING_SUCCESS,
  payload: systemSetttings
});
export const fetchSystemSetttingsFailure = error => ({
  type: FETCH_SYSTEM_SETTING_FAILURE,
  payload: error
});
