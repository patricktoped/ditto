var client = ZAFClient.init();
var config;
var user_id;
var shop_id;

client.invoke('resize', { width: '100%', height: '250px' });
client.metadata().then(function(metadata) {
    config = metadata.settings;
});

$(function() {  
    $(document).ready(function(){
        requestUserInfo();
    });  
    
    $(document).on("click", "#go-to-home", function(){
        renderNavigation({
            'user_id' : user_id,
            'shop_id' : shop_id
        });
        renderPage('home');
    }); 
    
    $(document).on("click", "#reset-buyer-notif", function(){
        resetNotification({ user_id : user_id }, 'buyer');
    }); 
    
    $(document).on("click", "#reset-seller-notif", function(){
        resetNotification({ shop_id : shop_id },'seller');
    }); 
});

function requestUserInfo() {
    client.get('ticket.requester.id').then(function(data) {
        var user_id = data['ticket.requester.id'];
        var settings = {
            url: '/api/v2/users/' + user_id + '.json',
            type:'GET',
            dataType: 'json',
        };

        client.request(settings).then(
            function(data) {
                showUserInfo(data);
            },
            function(response) {
                showError(response);
            }
        );
    }); 
}

function resetNotification(dt, type){
    dt.action = (type == 'seller') ? 'reset_seller_notification' : 'reset_buyer_notification';
    dt.token  = config.token;
    
    $.ajax({
        dataType: "jsonp",
        type: "GET",
        data : dt,
        url: config.subdomain+"/ajax/zendesk/zendesk.pl",
        jsonpCallback: "data_handler",
        timeout: 5000,
        success: function(result){
            var notif_data = new Object();
            console.log(result);
            if(result.success){
                notif_data['type'] = type;
                
                if(type == "buyer"){
                    notif_data['buyer'] = 1;
                    notif_data['notification'] = {
                        'buyer_order_status'  : result.notification.buyer_order_status,
                        'buyer_order_deliver' : result.notification.buyer_order_deliver,
                        'buyer_order_cancel'  : result.notification.buyer_order_cancel,
                        'buyer_pay_confirm'   : result.notification.buyer_pay_confirm,
                        'buyer_pay_confirmed' : result.notification.buyer_pay_confirmed
                    };
                }else if(type == "seller"){
                    notif_data['notification'] = {
                        'seller_new_order'     : result.notification.seller_new_order,
                        'seller_shipping_conf' : result.notification.seller_shipping_conf,
                        'seller_deliver_order' : result.notification.seller_deliver_order
                    };
                }
                renderPage('resetSuccess', notif_data);
            }
            else{
                renderPage('error');
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            renderPage('error', XMLHttpRequest);
        },
        beforeSend: function(){
            showLoading();
        },
        complete: function(){
            console.log("complete");
        }
    });
}

function renderNavigation(data){
    var html = Handlebars.compile($("#navbar-template").html())(data);
    $("#top-nav").removeClass("hidden");
    $("#top-nav").html(html);
}

function renderPage(name, data){
    var templates = {
        'index'        : '#index-template',
        'home'         : '#home-template',
        'loading'      : '#loading-template',
        'error'        : '#error-template',
        'resetSuccess' : '#reset-template'
    };

    var container = $("#main-content");
    var page      = templates[name];
    var source    = $(page).html();
    var template  = Handlebars.compile(source);
    var html      = template(data);

    container.html(html);
    
    var navbar = $(".navbar-toggle");
    if(navbar.attr("aria-expanded") == "true"){
        navbar.click();
    };
    
    hideLoading();
}

function formatDate(date) {
    var cdate = new Date(date);
    var options = {
        year: "numeric",
        month: "short",
        day: "numeric"
    };
    date = cdate.toLocaleDateString("en-us", options);
    return date;
}

function showLoading(){
    $("#apps-container").addClass("loading");
}

function hideLoading(){
    if($("#apps-container").hasClass("loading")){
        $("#apps-container").removeClass("loading");
    }
}

function showUserInfo(data) {
    var dt = new Object();
    dt.action     = "get_user_info";
    dt.user_email = encodeURIComponent(data.user.email);
    dt.token      = config.token;
    
    $.ajax({
        dataType: "jsonp",
        type: "GET",
        data : dt,
        url: config.subdomain+"/ajax/zendesk/zendesk.pl",
        jsonpCallback: "data_handler",
        timeout: 5000,
        success: function(result){
            var requester_data = new Object();

            if(result.user){
                user_id = result.user.id;
                requester_data['user'] = {
                    'id'     : result.user.id,
                    'name'   : data.user.name,
                    'email'  : data.user.email,
                    'status' : result.user.status,
                    'url'    : config.subdomain+"/people/"+result.user.id
                };
                if(result.shop){
                    shop_id = result.shop.id;
                    requester_data['shop'] = {
                        'id'     : result.shop.id,
                        'name'   : result.shop.name,
                        'domain' : result.shop.domain,
                        'url'    : config.subdomain+"/"+result.shop.domain
                    };
                }
            }

            renderPage('index', requester_data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            renderPage('error', XMLHttpRequest);
        },
        beforeSend: function(){
            showLoading();
        },
        complete: function(){
            console.log("complete");
        }
    });
}

function showError(response) {
    var error_data = {
        'status'     : response.status,
        'statusText' : response.statusText
    };
    
    renderPage('error', error_data);
}