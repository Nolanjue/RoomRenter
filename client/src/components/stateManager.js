export const updateMyState = ()=>({
  type: 'UPDATE_STATE',
})


export const updateUserState = ()=>({
  type: 'UPDATE_USER_STATE',
})


//will check everywhere, so we basically check if the user is on at all times..
//basically this state will be changed and will be addressed in other functions, so whenever I updateMystate, this can be addressed here