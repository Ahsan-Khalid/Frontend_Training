import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const addAddress = createAsyncThunk(
    'cart/addAddress',
    async ({
        id,
        addresses,
        token },
        thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:4000/api/cart/add-address', {
                id,
                addresses,
            },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const getAddress = createAsyncThunk(
    'cart/getAddress',
    async ({ id, token }, thunkAPI) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/cart/get-address?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const addPayment = createAsyncThunk(
    'cart/addPayment',
    async ({
        id,
        payments,
        token },
        thunkAPI) => {
        try {
            const response = await axios.post('http://localhost:4000/api/cart/add-payment', {
                id,
                payments,
            },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    items: [],
    totalWithoutTax: 0,
    totalWithTax: 0,
    tax: 0.05,
    error: null,
    orderSuccess: false,
    status: 'idle',
    addresses: [],
    loading: false,
};

function calculateTotalWithoutTax(items) {
    let totalPrice = 0;
    for (const item of items) {
        totalPrice += item.price * item.quantity;
    }
    return totalPrice;
}

function calculateTotalWithTax(items, tax) {
    let totalPrice = 0;
    for (const item of items) {
        totalPrice += item.price * item.quantity;
    }
    const taxAmount = totalPrice * tax;
    const totalWithTax = totalPrice + taxAmount;

    return totalWithTax;
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        userLogout: (state) => {
            state.items = [];
            state.totalWithoutTax = 0;
            state.totalWithTax = 0;
            state.tax = 0;
            state.error = null;
            state.status = 'idle';
            state.items = [];
        },
        addToCart: (state, action) => {
            state.orderSuccess = false;
            const { product, color, size, quantity } = action.payload;

            const existingItem = state.items.find(
                (item) =>
                    item.product._id === product._id &&
                    item.color === color &&
                    item.size === size
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    product,
                    color,
                    size,
                    price: product.price,
                    quantity,
                });
            }

            state.totalWithoutTax = calculateTotalWithoutTax(state.items);
            state.totalWithTax = calculateTotalWithTax(state.items, state.tax);
        },
        removeFromCart: (state, action) => {
            const itemIndexToRemove = action.payload;
            if (itemIndexToRemove >= 0 && itemIndexToRemove < state.items.length) {
                state.items.splice(itemIndexToRemove, 1);
                state.totalWithoutTax = calculateTotalWithoutTax(state.items);
                state.totalWithTax = calculateTotalWithTax(state.items, state.tax);
            }
        },
        removeAllItems: (state) => {
            state.items = [];
            state.totalWithoutTax = 0;
            state.totalWithTax = 0;
        },
        updateItemQuantity: (state, action) => {
            const { click, currentquantity } = action.payload;
            if (click >= 0 && click < state.items.length) {
                const newQuantity = currentquantity;
                if (newQuantity <= 0) {
                    state.items.splice(click, 1);
                } else {
                    state.items[click].quantity = newQuantity;
                }
                state.totalWithoutTax = calculateTotalWithoutTax(state.items);
                state.totalWithTax = calculateTotalWithTax(state.items, state.tax);
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.orderSuccess = true,
                state.totalWithoutTax = 0;
            state.totalWithTax = 0;
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(addAddress.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addAddress.fulfilled, (state) => {
                state.status = 'Added';
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(getAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAddress.fulfilled, (state, action) => {
                state.addresses = action.payload.addresses;
                console.log('address in slice', state.addresses);
                state.loading = false;
            })
            .addCase(getAddress.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(addPayment.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addPayment.fulfilled, (state) => {
                state.status = 'Paid';
            })
            .addCase(addPayment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});


export const { addToCart, removeFromCart, removeAllItems, updateItemQuantity, userLogout, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
