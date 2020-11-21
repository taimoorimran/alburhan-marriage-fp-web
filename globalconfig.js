const Gconfig = {
    "contentSettings": {
        "specialProductIDS": process.env.NEXT_PUBLIC_SPECIAL_PRODUCT_IDS
    },
    "fpAPI": "http://fpapi.fashionpass.co/fpapi/api/v1/",
    "banjoReview": "https://review.thefashionpass.com/reviewhaute/review/",
    "fashionpassS3Storage": "https://fashionpass.s3-us-west-1.amazonaws.com/",
    "fashionpassWaitList": "https://waitlist.thefashionpass.com/",
    "instagram": "https://www.instagram.com/fashionpass/",
    "facebook": "https://www.facebook.com/fashionpass/",
    "pinterest": "https://www.pinterest.com/thefashionpass/",
    "twitter": "https://twitter.com/fashionpass/",
    "banjoAPI": "https://stagemain.hautedb.com/",
    "banjoURL": "https://stagemain.hautedb.com/",
    "hautApi": "https://hautedb.com/hautapi/api_stage_main/"
}
Gconfig.collectionAPIURL = Gconfig.fpAPI + "collections/search/?";
Gconfig.collectionAPIHandleURL = Gconfig.fpAPI + "collections/SearchByHandle/";
export default Gconfig