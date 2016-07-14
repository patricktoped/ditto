var client = ZAFClient.init();
client.invoke('resize', { width: '100%', height: '250px' });

client.metadata().then(function(metadata) {
    console.log(metadata.settings);
});

var user_id = 0;

$(function() {  
    $(document).ready(function(){
        renderPage('loading');
        requestUserInfo();
    });  
    
    $(document).on("click", "#go-to-home", function(){
        $("#top-nav").removeClass("hidden");
        renderPage('home');
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

function renderPage(name, data){
    var templates = {
        'index'     : '#index-template',
        'home'      : '#home-template',
        'loading'   : '#loading-template',
        'error'     : '#error-template'
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

function showUserInfo(data) {
    var dt = new Object();
    dt.action     = "get_user_info";
    dt.user_email = data.user.email;
    
    $.ajax({
        "dataType": 'json',
        "type": "POST",
        "data" : dt,
        "url": 'http://new.pa-patrick.ndvl/ajax/zendesk/zendesk.pl',
        success: function(result){
            console.log(result);
            var requester_data = {
                'name'    : data.user.name,
                'email'   : data.user.email,
                'status'  : result.status,
                'user_id' : result.user_id
            };
            user_id = result.user_id;
            renderPage('index', requester_data);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            // tokopedia.alert_error();
            console.log(XMLHttpRequest);
            renderPage('error', XMLHttpRequest);
        },
        beforeSend: function(){
            // Handle the beforeSend event
            console.log("before send");
        },
        complete: function(){
            // Handle the complete event
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