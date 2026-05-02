<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="../public/css/style_forms.css">
    <link rel="stylesheet" href="../public/css/style_menu.css">
    <title>Login</title>
</head>

<body>

<header>
    <div class="logo">LOGO</div>
    <nav>
        <a href="../index.php">HOME</a>
        <a href="menu.php">MENU</a>
        <a href="#">ABOUT US</a>
        <a href="#">LOCATIONS</a>
        <a href="registerForm.php">SIGN UP</a>
        <a href="loginForm.php">LOG IN</a>
        <a href="reservationForm.php">RESERVATIONS</a>
        <a href="satisfactionForm.php">SATISFACTION SURVEYS</a>
    </nav>
</header>

<div id="content-spa" class="form-container">
    <div class="form-box">
        <h1>Login</h1>

        <form id="loginForm" onsubmit="validateAndSubmitLogin(event)">
            
            <fieldset class="form-section">
                <legend>ACCESS DATA</legend>

                <div class="form-group">
                    <label>Email or Username:</label>
                    <input type="text" name="user_identifier" id="user_identifier" required>
                </div>

                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" name="password" id="password" required>
                </div>

                <small id="loginError" class="error-text" style="color:red;"></small>

            </fieldset>

            <div class="form-actions">
                <input type="submit" value="Log In" class="btn btn-primary">

                <button type="button" onclick="window.history.back()" class="btn btn-danger">
                    Cancel
                </button>
            </div>

            <div class="form-group" style="margin-top: 10px;">
                <a href="#">Forgot your password?</a>
            </div>

        </form>
    </div>
</div>

<script src="../public/js/loginValidation.js"></script>

</body>
</html>