import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import api from '../../api';

import { STATUS } from '../constants';
import { addReview } from '../features/reviews';
import { isLoaded, shouldLoad } from '../utils';

export const loadRestaurants = createAsyncThunk(
  'restaurants/load',
  () => api.loadRestaurants(),
  { condition: (_, { getState }) => shouldLoadRestaurantsSelector(getState()) }
);

const Restaurants = createEntityAdapter();

const initialState = {
  ...Restaurants.getInitialState(),
  status: STATUS.idle,
  error: null,
};

const { reducer } = createSlice({
  name: 'restaurants',
  initialState,
  extraReducers: {
    [loadRestaurants.pending]: (state) => {
      state.status = STATUS.pending;
      state.error = null;
    },
    [loadRestaurants.fulfilled]: (state, action) => {
      state.status = STATUS.fulfilled;
      Restaurants.addMany(state, action);
    },
    [loadRestaurants.rejected]: (state, { error }) => {
      state.status = STATUS.rejected;
      state.error = error;
    },
    [addReview]: (state, { meta, payload }) => {
      state.entities[payload.restaurantId].reviews.push(meta.reviewId);
    },
  },
});

export default reducer;

const restaurantsSelector = (state) => state.restaurants.entities;
const restaurantsStatusSelector = (state) => state.restaurants.status;

export const restaurantsLoadedSelector = isLoaded(restaurantsStatusSelector);
const shouldLoadRestaurantsSelector = shouldLoad(restaurantsStatusSelector);

export const restaurantsListSelector = createSelector(
  restaurantsSelector,
  Object.values
);
export const restaurantSelector = (state, { id }) =>
  restaurantsSelector(state)[id];
