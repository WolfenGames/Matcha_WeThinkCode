$(document).ready(function(){
	$('#deleteprofile').click(function() {
		var email = $("#hiddenemail").val();
		$.post('/delete', {
			email: email
		}).done(function(data) {
			var msg = jQuery.parseJSON(data);
			if (msg['msg'] != "OK")
			{
				$("#error-modal").modal();
				$('#errorModalTitle').html("Error has occured");
				if (msg['extra'])
					$("#errorModalText").html(msg['msg'] + "\nReason: " + msg['extra']);
				else
					$("#errorModalText").html(msg['msg']);
			}else
			{	$("#error-modal").modal();
				$('#errorModalTitle').html("Account is deleted");
				$("#errorModalText").html("Redirecting to home page in 5s");
				setInterval(function() {location.replace('/logout/user'); }, 5000);
			}
		});
	});
});