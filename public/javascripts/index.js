function createErollment(){
    var formData = new FormData();
    var reader = new FileReader();

    reader.onloadend = function() {

        var dataUrl = reader.result;
        formData.append('Data',dataUrl);
        $.ajax({
            url:'enroll',
            // url: "https://westus.api.cognitive.microsoft.com/spid/v1.0/identificationProfiles/2aeb9b49-378f-45ed-832c-00bacc71556d/enroll",
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","multipart/form-data");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","9630458358cb45f5b84e84183200b897");
            },
            type: "POST",
            // Request body
            data: formData,
            processData: false,
            contentType : false
        })
        .done(function(data) {
            alert("success");
        })
        .fail(function() {
            alert("error");
        });

    };
    reader.readAsDataURL($('#files')[0].files[0]);
}