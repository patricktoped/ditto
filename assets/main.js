$(function() {
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '120px' });
    
    client.metadata().then(function(metadata) {
        console.log(metadata.settings);
    });
    /* 
    $.ajax({
            "dataType": 'json',
            "type": "GET",
            "url": 'http://new.pa-patrick.ndvl/ajax/zendesk_test.pl?action=reset_buyer_notification',
            // "data": aoData,
            success: function(result){
                console.log(result);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                // tokopedia.alert_error();
                console.log(XMLHttpRequest);
            },
            beforeSend: function(){
                // Handle the beforeSend event
                console.log("before send");
            },
            complete: function(){
                // Handle the complete event
                console.log("complete");
            }
    }); */
                
    /* client.request(settings).then(
        function(data) {
            // showInfo(data);
            console.log(data);
        },
        function(response) {
            // showError(response);
            console.log(response);
        }
    ); */
    
    $(document).ready(function(){
        renderPage('home');
    });
    
    $(document).on("click", "#user-profile", function(){
        client.get('ticket.requester.id').then(function(data) {
            var user_id = data['ticket.requester.id'];
            requestUserInfo(client, user_id);
        });
    });
    
    $(document).on("click", "#user-profile", function(){
        $(".btn").button('loading');
    });
    
    $(document).on("click", "#go-to-home", function(){
        renderPage('home');
    });
});

function renderPage(name, data){
    var templates = {
        'home'      : '#home-template',
        'error'     : '#error-template',
        'requester' : '#requester-template'
    };

    var container = $('section#main-content');
    var page      = templates[name];
    var source    = $(page).html();
    var template  = Handlebars.compile(source);
    var html      = template(data);
    console.log(html);
    container.html(html);
}

function requestUserInfo(client, id) {
    var settings = {
        url: '/api/v2/users/' + id + '.json',
        type:'GET',
        dataType: 'json',
    };

    client.request(settings).then(
        function(data) {
            showInfo(data);
        },
        function(response) {
            showError(response);
        }
    );
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

function showInfo(data) {
    var requester_data = {
        'name'          : data.user.name,
        'tags'          : data.user.tags,
        'created_at'    : formatDate(data.user.created_at),
        'last_login_at' : formatDate(data.user.last_login_at)
    };
    
    renderPage('requester', data);
}

function showError(response) {
    var error_data = {
        'status'     : response.status,
        'statusText' : response.statusText
    };
    
    renderPage('error', data);
}