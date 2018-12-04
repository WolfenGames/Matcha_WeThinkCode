$(document).ready(function(){
	$('#Login-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		$.post('/login/user', {
			email: email,
			password: pass
		}).done(function(data) {
			var msg = jQuery.parseJSON(data);
			if (msg['msg'] != "OK")
			{
				$("#error-modal").modal();
				$('#errorModalTitle').html("Error has occured");
				$("#errorModalText").html(msg['msg']);
			}else
				location.replace('/');
		});
	});
});