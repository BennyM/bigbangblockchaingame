using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using BigBangBlockchainGame.Models;
using Facebook;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using System.Net.Http;

namespace BigBangBlockchainGame.Controllers
{
    [Authorize]
    public class AccountController : Controller
    {
        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;

        public AccountController()
        {
        }

        public AccountController(ApplicationUserManager userManager, ApplicationSignInManager signInManager )
        {
            UserManager = userManager;
            SignInManager = signInManager;
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set 
            { 
                _signInManager = value; 
            }
        }

        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        [HttpPost]
        public async Task<ActionResult> RegisterAddress(string address)
        {
            var userContext = ApplicationDbContext.Create();
             var user = userContext.Users.Single(x => x.Name == User.Identity.Name);
            if (string.IsNullOrWhiteSpace(user.Address))
            {
                user.Address = address;
                userContext.SaveChanges();

                HttpClient client = new HttpClient();



                var response = await client.PostAsync("http://clbrewaji.westeurope.cloudapp.azure.com/", new StringContent("etherAddress=" + address, Encoding.UTF8, "application/x-www-form-urlencoded"));
                response.EnsureSuccessStatusCode();
                
            }
            return new HttpStatusCodeResult(200);
        }

        //
        // GET: /Account/Login
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            ViewBag.ReturnUrl = returnUrl;
            return View();
        }
        
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ExternalLogin(string provider, string returnUrl)
        {
            // Request a redirect to the external login provider
            return new ChallengeResult(provider, Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }));
        }
        
        [AllowAnonymous]
        public async Task<ActionResult> ExternalLoginCallback(string returnUrl)
        {
            var loginInfo = await AuthenticationManager.GetExternalLoginInfoAsync();
            if (loginInfo == null)
            {
                return RedirectToAction("Login");
            }

            // Sign in the user with this external login provider if the user already has a login
            var result = await SignInManager.ExternalSignInAsync(loginInfo, isPersistent: false);
            switch (result)
            {
                case SignInStatus.Success:
                    return RedirectToLocal(returnUrl);
                case SignInStatus.Failure:
                default:
                    // If the user does not have an account, then prompt the user to create an account
                    ViewBag.ReturnUrl = returnUrl;
                    ViewBag.LoginProvider = loginInfo.Login.LoginProvider;
                    var emailClaim = loginInfo.ExternalIdentity.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);
                    var user = new ApplicationUser { UserName = Guid.NewGuid().ToString(), Name = loginInfo.ExternalIdentity.GetName(), Email = loginInfo.Email ?? emailClaim?.Value};
                    if (string.IsNullOrEmpty(user.Email))
                    {
                        if (loginInfo.Login.LoginProvider == "Facebook")
                        {
                            var identity = AuthenticationManager.GetExternalIdentity(DefaultAuthenticationTypes.ExternalCookie);
                            var access_token = identity.FindFirstValue("FacebookAccessToken");
                            if (!string.IsNullOrEmpty(access_token))
                            {
                                var fb = new FacebookClient(access_token);
                                dynamic myInfo = fb.Get("/me?fields=email"); // specify the email field
                                user.Email = myInfo.email;
                            }
                        }
                    }
                    var createUserResult = await UserManager.CreateAsync(user);
                    if (createUserResult.Succeeded)
                    {
                        createUserResult = await UserManager.AddLoginAsync(user.Id, loginInfo.Login);
                        if (createUserResult.Succeeded)
                        {
                            await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                            return RedirectToLocal(returnUrl);
                        }
                    }
                    return View("ExternalLoginFailure");
            }
        }
        
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult LogOff()
        {
            AuthenticationManager.SignOut(DefaultAuthenticationTypes.ApplicationCookie);
            return RedirectToAction("Index", "Home");
        }

        //
        // GET: /Account/ExternalLoginFailure
        [AllowAnonymous]
        public ActionResult ExternalLoginFailure()
        {
            return View();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (_userManager != null)
                {
                    _userManager.Dispose();
                    _userManager = null;
                }

                if (_signInManager != null)
                {
                    _signInManager.Dispose();
                    _signInManager = null;
                }
            }

            base.Dispose(disposing);
        }

        #region Helpers
        // Used for XSRF protection when adding external logins
        private const string XsrfKey = "XsrfId";

        private IAuthenticationManager AuthenticationManager
        {
            get
            {
                return HttpContext.GetOwinContext().Authentication;
            }
        }

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }

        private ActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            return RedirectToAction("Index", "Home");
        }

        internal class ChallengeResult : HttpUnauthorizedResult
        {
            public ChallengeResult(string provider, string redirectUri)
                : this(provider, redirectUri, null)
            {
            }

            public ChallengeResult(string provider, string redirectUri, string userId)
            {
                LoginProvider = provider;
                RedirectUri = redirectUri;
                UserId = userId;
            }

            public string LoginProvider { get; set; }
            public string RedirectUri { get; set; }
            public string UserId { get; set; }

            public override void ExecuteResult(ControllerContext context)
            {
                var properties = new AuthenticationProperties { RedirectUri = RedirectUri };
                if (UserId != null)
                {
                    properties.Dictionary[XsrfKey] = UserId;
                }
                context.HttpContext.GetOwinContext().Authentication.Challenge(properties, LoginProvider);
            }
        }
        #endregion
    }
    public static class NameHelper
    {
        internal const string NameClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
        internal const string EmailClaim = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

        public static string GetName(this ClaimsIdentity identity)
        {
            return identity.FindFirstValue(NameClaim);
        }

        public static string GetGravatarUrl(this ClaimsIdentity identity)
        {
            string email = identity.FindFirstValue(EmailClaim) ?? "noemail@hotmail.com";
            using (System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create())
            {
                var hash = string.Concat(md5.ComputeHash(Encoding.ASCII.GetBytes(email)).Select(x => x.ToString("X2"))).ToLower();
                return "https://www.gravatar.com/avatar/" + hash + "?d=identicon";
            }
        }
    }
}