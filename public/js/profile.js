$(document).ready(function(){
	//Delete profile section
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
	//About me section
	$('#biographylength').html("&lt;" + (150 - $("#biography").val().length).toString() + " characters left/&gt;");
	$('#biography').bind('input propertychange', function() {
		$('#biographylength').html("&lt;" + (150 - $("#biography").val().length).toString() + " characters left/&gt;");
	});
	//Edit Sections --Username--
	var usernamehold;
	$('.username-label').click(function () {
		usernamehold = $('.username-label').text();
		$(this).hide();
		$(this).siblings('.username-edit-input').val(usernamehold);
		$(this).siblings('.username-edit-input').text(usernamehold);
		$(this).siblings('.username-edit-input').show();
		$(this).siblings('.username-edit-input').focus();
    });
    
    $('.username-edit-input').focusout(function() {
		$(this).hide();
		$(this).siblings('.username-label').text($(this).val()).show();
		var username = $(".username-label").text();
		$.post('/update/Username', {
			username: username
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
				$('.username-label').text(usernamehold);
			}
		});
	});
	//Edit Sections --Email--
	var emailhold;
	$('.email-label').click(function () {
		emailhold = $('.email-label').text();
		$(this).hide();
        $(this).siblings('.email-edit-input').val(emailhold);
        $(this).siblings('.email-edit-input').text(emailhold);
        $(this).siblings('.email-edit-input').show();
        $(this).siblings('.email-edit-input').focus();
    });
    
    $('.email-edit-input').focusout(function() {
		$(this).hide();
		if ($(this).val() === null)
			$(this).text(emailhold);
		$(this).siblings('.email-label').text($(this).val()).show();
		var email = $(".email-label").text();
		$.post('/update/Email', {
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
			}
		});
	});
	
	//Biography update
	$('#biography').focusout(function(){
		var biographydata = $(this).val();
		$.post('/update/Biography', {
			biography: biographydata
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
			}
		});
	});

	//Edit Sections --Firstname--
	var firstnamehold;
	$('.firstname-label').click(function () {
		firstnamehold = $('.firstname-label').text();
		$(this).hide();
		$(this).siblings('.firstname-edit-input').val(firstnamehold);
		$(this).siblings('.firstname-edit-input').text(firstnamehold);
		$(this).siblings('.firstname-edit-input').show();
		$(this).siblings('.firstname-edit-input').focus();
    });
    
    $('.firstname-edit-input').focusout(function() {
		$(this).hide();
		$(this).siblings('.firstname-label').text($(this).val()).show();
		var firstname = $(".firstname-label").text();
		$.post('/update/Firstname', {
			firstname: firstname
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
				$('.username-label').text(firstnamehold);
			}
		});
	});
	
	//Gender Selector update
	$('#GenderGroup').change(function() {
		var gender = $(this).val();
		$.post('/update/Gender', {
			gender: gender
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
			}
		});
	});
	//Sexuality Selector update
	$('#SexualityGroup').change(function() {
		var sex = $(this).val();
		$.post('/update/Sex', {
			sex: sex
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
			}
		});
	});
});