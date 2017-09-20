
$(function () {
    $('#submit').click(function (){
        if(window.password === $('#password').val()){
            Materialize.toast('Payment is none!', 3000, '', function () {
                window.location.href = '/summary';
            });
        } else {
            Materialize.toast('Password is incorrect', 3000);
        }
    });
    $('#signup').click(function () {
        if(!($('#first_name').val()&&$('#last_name').val()
        &&$('#email').val()&&$('#password').val())){
            Materialize.toast('All input feilds are required!', 3000);
            return;
        }
        var userInfo = {
            fName: $('#first_name').val(),
            lName: $('#last_name').val(),
            email: $('#email').val(),
            password: $('#password').val()
        }
        window.localStorage.setItem('user', JSON.stringify(userInfo))
        window.location.href = '/dashboard';
    });
});
window.createProfile = function(url) {
        var action = location.pathname.indexOf('identification') > -1 ?'verify':'enroll';
        if(action === 'verify'){
            createErollment('',url);
            return;
        }

        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles",
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","9630458358cb45f5b84e84183200b897");
            },
            type: "POST",
            // Request body
            data: "{locale:'en-us'}",
        })
        .done(function(data) {
            createErollment(data.identificationProfileId,url);
        })
        .fail(function() {
            alert("error");
        });
    }
    function createErollment(id, blob){

        var reader = new FileReader();
        reader.onloadend = function() {
            var formData = new FormData;
            formData.append('file', blob);
            var dataUrl = reader.result;
            var b4 = dataUrl.split(',')[1];
            var action = location.pathname.indexOf('identification') > -1 ?'verify':'enroll';
            var data;
            if(action==='verify') {
                data = {
                    url: b4,
                };
            } else {
                data = {
                    id: id,
                    url: b4,
                    userInfo: window.localStorage.getItem('user')
                };
            }

            $.ajax({
                url: action,
                // url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/"+id+"/enroll",
                type: "POST",
                // Request body
                data: data,
                // contentType: false,
                // cache: false,
                // processData: false
            })
            .done(function(data) {
                if  (action!=='verify') {
                    Materialize.toast('Enroll Successfully!', 3000);
                    $('#record').hide();
                } else {
                    $('#result').html('Hi <span class="lime">' + data.fName + ' ' + data.lName + '</span>, please input your payment passward:'  );
                    $('#confirmPassword').removeClass('hide');
                    window.password = data.password;
                }
            })
            .fail(function() {
                if  (action!=='verify') {
                    Materialize.toast('Enroll Failed! Please try again', 3000);
                } else {
                    Materialize.toast('Cannot identify you! Please try again', 3000);
                }
            });
        }
        reader.readAsDataURL(blob);
    }




