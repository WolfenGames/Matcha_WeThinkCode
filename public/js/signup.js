$(document).ready(function(){
	$('#Signup-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		var cpass = $('#cpassword').val();
		console.log("pressed");
		$.post('/User/Create', {
			Email: email,
			oPassword: pass,
			cPassword: cpass
		}), function(data, success) {
			alert('Status ' + success);
	}});
});