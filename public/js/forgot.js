$(document).ready(function(){
	$('#Forgot-Button').click(function() {
		var email = $('#email').val();
		var verify = $('#verify').val();
		var pass = $('#password').val();
		var cpass = $('#cpassword').val();
		$.post('/resetpass', {
			Email: email,
			oPassword: pass,
			cPassword: cpass,
			verify: verify	
		}).done(function(data) {
			var msg = jQuery.parseJSON(data);
			if (msg['msg'] != "OK")
			{
				$("#error-modal").modal();
				$('#errorModalTitle').html("Error has occured");
				$("#errorModalText").html(msg['msg']);
			}else{
				$("#error-modal").modal();
				$('#errorModalTitle').html("Password reset");
				$("#errorModalText").html("Redirecting to Login page in 5s");
				setInterval(function() {location.replace('/')}, 5000);
			}
		});
	});
});