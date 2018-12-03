$(document).ready(function(){
	$('#Login-Button').click(function() {
		var email = $('#email').val();
		var pass = $('#password').val();
		$.post('/login/user', {
			email: email,
			password: pass
		}).done(function() {
            alert("Done");
		});
	});
});