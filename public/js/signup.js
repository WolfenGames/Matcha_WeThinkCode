$(document).ready(function(){
	$('#Signup-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		var cpass = $('#cpassword').val();
		var emailpref = $('#emailpref').is(":checked");
		$.post('/User/Create', {
			Email: email,
			oPassword: pass,
			cPassword: cpass,
			emailpref: emailpref			
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