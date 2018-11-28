$(document).ready(function(){
	$('#Signup-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		var cpass = $('#cpassword').val();
		var emailpref = $('#emailpref').is(":checked");
		console.log('Hello???');
		$.post('/User/Create', {
			Email: email,
			oPassword: pass,
			cPassword: cpass,
			emailpref: emailpref			
		}).done(function(res) {
			console.log(res);
			window.location.href = "/login";
		});
	});
});