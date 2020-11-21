import React, { Component } from 'react';
import jsHttpCookie from 'cookie';
import jsCookie from 'js-cookie';
import fetch from 'isomorphic-unfetch';
import { fetchCustomerSuccess, fetchCustomerFailure } from "redux/actions/customerActions"
import { fetchproductSuccess, fetchproduct } from 'redux/actions/productActions'
import { saveRecentProducts, saveRecentProductsSucess } from 'redux/actions/recentProductActions'
import { fetchProductReviews, fetchProductReviewsSucess } from 'redux/actions/productReviewActions'
import { fetchPlansStarted, fetchPlansSuccess } from "redux/actions/plansActions"
import { fetchSystemSetttingsSuccess,fetchSystemSetttingsFailure } from "redux/actions/systemSettingsActions"
import { getCustomerCart } from 'components/shared/cartFunctions';
import Gconfig from "globalconfig"
import moment from "moment";
function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toUpperCase() : word.toLowerCase();
    }).replace(/\s+/g, '');
}
function gtUpgradablePlan(str) {
    if (str == "SOCIALITE") {
        return "TRENDSETTER"
    }
    else {
        return "WANDERLUST"
    }
}

function checkUserAthentication(server) {

    return async (dispatch, req) => {
        let cookies = '';
        if (server && server.headers) {
            cookies = server.headers.cookie;
        } else {
            cookies = document.cookie;
        }
        if (cookies != '') {
            if (typeof cookies === 'string') {
                const cookiesJSON = jsHttpCookie.parse(cookies);
                if (cookiesJSON.customer_token != undefined) {
                    let customer_token = cookiesJSON.customer_token
                    await fetch(Gconfig.fpAPI + '/Customer/GetCustomerSummary', {
                        method: 'GET',
                        headers: { 'Authorization': 'Bearer ' + customer_token }
                    }).then(response => response.json()).then(data => {
                        // console.log(data)
                        if (data.success) {
                            let customer = data.customer_summary;
                            jsCookie.set('customer_data', customer);
                            dispatch(fetchCustomerSuccess(customer))
                        } else {
                            console.log('test customer logout --------------')
                            // jsCookie.remove('customer_data');
                            jsCookie.remove('customer_token');
                            dispatch(fetchCustomerFailure('not login'))
                        }
                    }).catch(function (error) {
                        console.log(error);
                        dispatch(fetchCustomerFailure(error))
                    });
                } else {
                    console.log('customer not login')
                }


            }
        }

    }
}
async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

function getAuthTokenfromcookie(server) {
    let cookies = '';
    let customer_token = "not loged in";
    if (server && server.headers) {
        cookies = server.headers.cookie;
    } else {
        cookies = document.cookie;
    }
    if (cookies != '') {
        if (typeof cookies === 'string') {
            const cookiesJSON = jsHttpCookie.parse(cookies);
            if (cookiesJSON.customer_token != undefined) {
                // console.log(cookiesJSON.customer_token)
                customer_token = cookiesJSON.customer_token
            }
        }
    }
    return customer_token;
}

function getCustomerTags(customer_id) {
    return async (dispatch, getState) => {
        let customer_old = getState().customer;
        let customer_token = getAuthTokenfromcookie(false);
        console.log(customer_old);
        customer_old.customer.tag_list;
        await fetch(Gconfig.fpAPI + `/Customer/GetCustomerTags`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + customer_token }
        }).then(response => response.json()).then(data => {
            customer_old.customer.tag_list = data.tags;
            dispatch(fetchCustomerSuccess(customer_old.customer))

        })


    }
}
function getPlansData() {
    console.log("GET PLANS CALLED");
    return async (dispatch, getState) => {
        let oldRecentPlans = getState().currentPlans;
        if (oldRecentPlans.plans.success) {
            return;
        }
        dispatch(fetchPlansStarted())
        await fetch(Gconfig.fpAPI + `/Content/GetSubscriptionPlans`).then(response => response.json()).then(data => {

            dispatch(fetchPlansSuccess(data));

        })
    }
}
function getCurrentPlan(customer, plans) {

    let customerPlanTag = customer.customer.tag_list.find(function (element) {

        if (element.indexOf("plan_name") > -1) {
            return true;
        };
    });

    if (customerPlanTag == undefined) {
        return "-1";
    }
    else {
        customerPlanTag = customerPlanTag.split(":")[1];
        if (plans.plans.hasOwnProperty('plans')) {
            let currentCustomerPlan = plans.plans.plans.find((element) => {
                if (element.title == customerPlanTag.toUpperCase()) {
                    return true;
                }
            })

            return currentCustomerPlan;
        }
    }


}
async function getRecentProducts(customer_id) {
    var RecentProductData = null;
    await fetch(Gconfig.fpAPI + `/Product/GetRecentProducts/customer/${customer_id}`).then(response => response.json()).then(data => {
        RecentProductData = data;
    });
    return RecentProductData;
}
async function addToRecentProducts(product_id, customer_id) {
    await fetch(Gconfig.fpAPI + `/Product/AddRecentProduct/product/${product_id}/customer/${customer_id}`);
}
async function getProductDataByProductID(product_ids) {
    var productData = '';
    if(typeof product_ids == 'object') product_ids = product_ids.toString();
    console.log(Gconfig.fpAPI + `/Product/GetProductsInfo/${product_ids}`);
    await fetch(Gconfig.fpAPI + `/Product/GetProductsInfo/${product_ids}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) productData = data.products_info;
        })
    return productData;
}
function getProductData(product_id, isServer) {

    return async (dispatch, getState, isServer) => {
        let oldRecentProducts = getState().recentProducts.RecentProducts;
        if (isServer != true) {
            dispatch(fetchproduct())
        }
        //await sleep(3000); //for testing
        await fetch(Gconfig.fpAPI + `/Product/GetProductInfo/${product_id}`).then(response => response.json()).then(data => {
            dispatch(fetchproductSuccess(data))
            oldRecentProducts.push(data);
            dispatch(saveRecentProducts(""))
            if (oldRecentProducts.length > 9) {
                oldRecentProducts.shift();
            }
            dispatch(saveRecentProductsSucess(oldRecentProducts))
        })
    }
}

function getProductReviews(product_id, type, isServer) {
    debugger;
    console.log(Gconfig.banjoReview + `getreviews.php?product_id=${product_id}&limit=0&type=${type}&befirst=1&cid=32829&calltype=react`);
    return async (dispatch, getState, isServer) => {
       

        // await fetch(Gconfig.fpAPI + `/Product/GetReviewsBanjo/${product_id}/type/${type}`).then(response => response.json()).then(data => {
        //     dispatch(fetchProductReviewsSucess(data, 1, product_id))
        // })
        await fetch(Gconfig.banjoReview + `getreviews.php?product_id=${product_id}&limit=0&type=${type}&befirst=1&cid=32829&calltype=react`).then(response => response.json()).then(data => {
            dispatch(fetchProductReviewsSucess(data, 1, product_id))
        })
    }
}
async function getContactUSData() {

    let ContactData = null;
    await fetch(Gconfig.fpAPI + `/Content/GetPageContentByHandle/contact-us`).then(response => response.json()).then(data => {
        ContactData = data;
    })
    return ContactData;
}

async function getPressData() {
    let PressData = null;
    await fetch(Gconfig.fpAPI + `/Content/GetPageContentByHandle/press`).then(response => response.json()).then(data => {
        PressData = data;
    })
    return PressData;
}

async function getOrderData() {

    let customer_token = getAuthTokenfromcookie(false);
    return await fetch(Gconfig.fpAPI + `/Customer/GetOrders`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + customer_token }
    }).then(response => response.json()).then(data => {
        return data;
    });
}

async function getBrandData() {
    let BrandData = null;
    await fetch('').then(response => response.json()).then(data => {
        BrandData = data;
    })
    return BrandData
}
function loginUser(email, password, setModal) {
    return async (dispatch, req) => {
        if (email != '' && password != '') {
            document.getElementById("errorMessageArea").style.display = "none";
            document.getElementById("loading-img-login").style.display = "block";
            fetch(Gconfig.fpAPI + '/Customer/Authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }
                )
            }).then(response => response.json()).then(data => {
                // console.log(data)
                if (data.success) {
                    setModal(false)
                    jsCookie.set('customer_token', data.customer.token);
                    document.getElementById("loading-img-login").style.display = "none";
                    dispatch(checkUserAthentication());
                    dispatch(getCustomerCart());
                } else {
                    document.getElementById("loading-img-login").style.display = "none";
                    document.getElementById("errorMessageArea").style.display = "block";
                    document.getElementById("errorMessageArea").innerHTML = data.message;


                }
            });

        }
    }
}
function getPlanNameAgianstSubscriptionName(subscription_name) {
    if (subscription_name == "Gold") {
        return "Socialite";
    }
    else if (subscription_name == "Platinum") {
        return "Trendsetter";
    }
    else if (subscription_name == "Wanderlust") {
        return "Wanderlust";
    }
}

function getPlanAmount(subscription_name) {
    if (subscription_name == Gconfig.plan[0].planName) {
        return Gconfig.plan[0].price
    } else if (subscription_name == Gconfig.plan[1].planName) {
        return Gconfig.plan[1].price
    } else if (subscription_name == Gconfig.plan[2].planName) {
        return Gconfig.plan[2].price
    }
}

function addedItemProcess(obj, tagAdd, tagRemove, callback) {
    return async (dispatch, getstate) => {
        await fetch(Gconfig.banjoAPI + '/Credit_card_hash/create_charge_adding_items?cus_email=' + obj.email + '&quantity=' + obj.quantity, {
            method: 'GET',
        }).then(response => response.json()).then(data => {
            console.log(data)
            if (data.status == 1) {
                updateCustomerTags(tagAdd, tagRemove).then(response => response.json()).then(data => {
                    let customer = getstate().customer
                    customer.customer.tag_list = data.tags
                    console.log(customer)
                    dispatch(fetchCustomerSuccess(customer.customer))
                    let items = 'item'
                    if (obj.quantity > 1) {
                        items = 'items'
                    }
                    let subject = (customer.customer.first_name + ' ' + customer.customer.last_name) + ' paid for ' + obj.quantity + ' extra ' + items + ' !'
                    let body = "Email: <a href='" + Gconfig.banjoURL + "/search?ref=" + customer.customer.email + "'>" + customer.customer.email + "<a><br><br>Plan: " + getPlanNameAgianstSubscriptionName(customer.customer.subscription_name)
                    emailToadminForEarlyCheckin(subject, body)
                });
            } else {
                callback(data.data)
            }

        })
    }
}

async function updateCustomerTags(add, remove) {
    let customer_token = getAuthTokenfromcookie();
    if (customer_token != undefined) {
        return fetch(Gconfig.fpAPI + '/Customer/UpdateCustomerTags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + customer_token },
            body: JSON.stringify({ tags_to_add: add, tags_to_remove: remove }
            )
        })
    }
}

async function dropCustomerPoints(email, points, reason) {
    if (reason == undefined) {
        reason = 'default';
    }
    await fetch(Gconfig.banjoAPI + '/Customer_data_endpoint/dropPoints?email=' + email + '&points=' + points + '&reason=' + reason, {
        method: 'GET',
    })
}
function earlyCheckinProcess(email, tagAdd, tagRemove, callback) {
    return async (dispatch, getstate) => {
        await fetch(Gconfig.banjoAPI + '/Credit_card_hash/create_charge_early_checkin?cus_email=' + email, {
            method: 'GET',
        }).then(response => response.json()).then(data => {
            console.log(data)
            let customer = getstate().customer
            if (data.status == 1) {
                updateCustomerTags(tagAdd, tagRemove).then(response => response.json()).then(data => {
                    customer.customer.tag_list = data.tags;
                    dispatch(fetchCustomerSuccess(customer.customer))
                    let subject = (customer.customer.first_name + ' ' + customer.customer.last_name) + ' paid for early check in!'
                    let body = "<a href='" + Gconfig.banjoURL + "/search?ref=" + customer.customer.email + "'>" + customer.customer.email + "</a><br><br>Plan: " + getPlanNameAgianstSubscriptionName(customer.customer.subscription_name)
                    emailToadminForEarlyCheckin(subject, body)
                });
            } else {
                let subject = 'Additional items payment failed for ' + customer.customer.email
                let body = "Name:" + (customer.customer.first_name + ' ' + customer.customer.last_name) + "<br>Email: <a href='" + Gconfig.banjoURL + "/search?ref=" + customer.customer.email + "'>" + customer.customer.email + "</a><br>Failed Amount: $11.95"
                emailToadminForEarlyCheckin(subject, body)
                callback(data.data)
            }

        })
    }
}
function getCustomerDefaultPaymentMethod() {
    let customer_token = getAuthTokenfromcookie();
    if (customer_token != undefined) {
        return (dispatch, getstate) => {
            return fetch(Gconfig.fpAPI + 'customer/GetDefaultPaymentMethod', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + customer_token },
            }).then(response => response.json()).then(data => {
                let customer = getstate().customer.customer
                customer.default_payment_method = data.pay_method
                dispatch(fetchCustomerSuccess(customer))
                return data
            })
        }
    }
}
function emailToadminForEarlyCheckin(subject, body) {
    let obj = { subject: subject, body: body };
    fetch(Gconfig.banjoAPI + '/Credit_card_hash/sent_email_early_checkin?subject=' + subject + '&body=' + body, {
        method: 'GET',
        data: obj
    })
}
function inputValidationForRequired(event) {
    let feildError = false
    for (let i = 0; i < event.target.elements.length; i++) {
        let element = event.target.elements;
        if (element[i].className.indexOf('required') > -1 && element[i].value == '') {
            element[i].classList.add("errorInput");
            feildError = true
        } else {
            element[i].classList.remove("errorInput");
        }

    }
    return feildError

}

function inputValidationError(event) {
    let elements = event.target.elements
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].value == '' && elements[i].getAttribute('req-error')) {
            return elements[i].getAttribute('req-error')
        }
    }
}

function numericOnly(value) {
    return (/^[0-9]*$/gm).test(value)
}

function alphabetOnly(value) {
    return (/^[a-zA-Z\s]*$/gm).test(value)
}

function alphaNumeric(value) { // only hash allowed
    return (/[a-zA-Z0-9\s#.]+$/gm).test(value)
}
function validateEmail(email) {
    return (/\S+@\S+\.\S+/).test(email);
}
function validateCardNumber(card) {
    return card.length >= 14 && card.length <= 16;
}

function noSpecialCharacters(value) {
    return (value).match(/[A-Za-z0-9]*$/g)
}

function copyText(element) {
    let selection = window.getSelection()
    var range = document.createRange()
    range.selectNodeContents(element)
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand('Copy')
}

function emailChangePlan(data) {
    fetch(Gconfig.hautApi + 'StripePlans/planemails.php?action=' + data.action + '&oldPlan=' + data.oldPlan + '&newPlan=' + data.newPlan + '&firstName=' + data.firstName + '&amount=' + data.planAmount + '&customerEmail=' + data.email + '&daysLeft=' + data.daysLeft + '&nextBilling=' + data.nextBillingDate + '&CB=' + data.cb_status, {
        method: 'GET'
    }).then(response => {
        console.log(response)
    })
}

async function getSubscriptionId(stripe_id) {
    return fetch(Gconfig.banjoAPI + 'Customer_data_endpoint/get_subscription_id', {
        method: 'POST',
        body: JSON.stringify({
            stripe_id: stripe_id
        })
    }).then(response => response.text()).then(data => {
        return data
    })
}

function upgradePlan(data, emailData) {
    let subscriptionData = {
        "sub_id": data.subscriptionId,
        "plan": data.plan_id,
        "prorate": 'false',
        "cb_status": data.cb_status,
        "leftdays": data.leftDays,
        "email_id": data.email,
        "name": data.name
    }
    return async (dispatch, getstate) => {
        return fetch(Gconfig.hautApi + 'StripePlans/Subscriptions_Upgrade.php', {
            method: 'POST',
            body: JSON.stringify(subscriptionData)
        }).then(response => response.text()).then((res) => {
            console.log()
            if (res.indexOf('successfully upgrade') != -1) {
                let customer = getstate().customer.customer
                customer.subscription_name = data.subscription_name
                dispatch(fetchCustomerSuccess(customer))
                emailChangePlan(emailData)
                updateCustomerTags(data.newPlan, data.currentPlan)
                return true
            } else if (res.indexOf('Your card was declined.') != -1) {
                return false
            }
        })
    }

}

function cancelDowngradePlan(subject, body, tagToRemove) {
    return async (dispatch, getstate) => {
        return updateCustomerTags('', tagToRemove).then(response => response.json()).then(data => {
            if (data.success == true) {
                let customer = getstate().customer
                customer.customer.tag_list = data.tags;
                dispatch(fetchCustomerSuccess(customer.customer))
                emailToadminForEarlyCheckin(subject, body)
                return true
            }
        })
    }
}

function searchTag(tags, tagToFind) {
    let customer_token = getAuthTokenfromcookie();
    if (customer_token != undefined && tags != undefined) {
        let tagList = tags.join().toLowerCase()
        if (tagList.indexOf(tagToFind) != -1) {
            return true
        } else {
            return false
        }
    }
}
function getRangeBetweenTwoNumbers(range) {
    const start = range.start || 0;
    const end = range.end || 0;
    const step = range.step || 1;
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill().map((_, idx) => start + (idx * step))
}
function getSplitedCardExpiryFormat(expiry, returnStringFormat = true) {
    let exMonth = parseInt(expiry[0] + expiry[1]);
    let exYear = parseInt('20' + expiry[2] + expiry[3]);
    if (!returnStringFormat) return { month: exMonth, year: exYear };
    return exMonth + '/' + exYear;
}
function validateCardExpiryMonth(date) {
    return moment(moment(date, 'MM-YYYY').toDate()).isSameOrAfter(moment().add(1, 'months'), 'month');
}
function generateRandomString(length = 6, include = { smallCaps: false, numerals: false }) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (include.smallCaps) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (include.numerals) characters += '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function getTagValueFromTagList(_haystack, _needle = "Profile IP: ") {
    if (_haystack.length <= 0) return;
    _haystack.map((hay, x) => {
        if (hay.includes(_needle)) return hay.substring(_needle.length);
    })
}
function getSystemSettings() {
    return async (dispatch, getState) => {
        fetch(Gconfig.fpAPI + `/WebsiteSettings/GetSystemSettingByIdList/${Gconfig.system_settings.customerCreadit},${Gconfig.system_settings.earlyCheckin},${Gconfig.system_settings.addedItem},${Gconfig.system_settings.addedItem2},${Gconfig.system_settings.AdditionalItem}`).then(response => response.json()).then(data => {
            dispatch(fetchSystemSetttingsSuccess(data.system_settings.system_settings))
        })
    }
}
export {
    checkUserAthentication, getProductData, getProductDataByProductID,
    getProductReviews, getContactUSData, getPlansData,
    loginUser, getCurrentPlan, camelize, gtUpgradablePlan, getPressData,
    addToRecentProducts, getRecentProducts, getPlanNameAgianstSubscriptionName,
    getCustomerTags, getAuthTokenfromcookie, addedItemProcess, updateCustomerTags,
    dropCustomerPoints, earlyCheckinProcess, getCustomerDefaultPaymentMethod,
    inputValidationForRequired, numericOnly, alphabetOnly, alphaNumeric, validateEmail, validateCardNumber, inputValidationError,
    emailToadminForEarlyCheckin, getPlanAmount, emailChangePlan, getSubscriptionId, upgradePlan,
    getOrderData, cancelDowngradePlan, searchTag, getRangeBetweenTwoNumbers, getSplitedCardExpiryFormat, validateCardExpiryMonth, generateRandomString, copyText, noSpecialCharacters,
    getTagValueFromTagList,getSystemSettings
}
// export default checkUserAthentication;
