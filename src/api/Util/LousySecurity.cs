using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace api.Util
{    
    public static class AppBuilderExtensions
    {
        /// <summary>
        /// Adds lousy security: user has unique key and if it is lost, he/she can't log in anymore.
        /// </summary>
        public static IApplicationBuilder UseLousySecurity(this IApplicationBuilder app) 
        {
            return app.UseMiddleware<LousySecurityMiddleware>();
        }
    }

    public class LousySecurityMiddleware : AuthenticationMiddleware<LousySecurityOptions>
    {
        public LousySecurityMiddleware(RequestDelegate next, IOptions<LousySecurityOptions> options, ILoggerFactory loggerFactory, UrlEncoder encoder, BbbgContext dbContext)
            : base(next, options, loggerFactory, encoder)
        {            
            options.Value.DbContext = dbContext;
        }

        protected override AuthenticationHandler<LousySecurityOptions> CreateHandler()
        {
            return new LousySecurityHandler();
        }
    }

    public class LousySecurityHandler : AuthenticationHandler<LousySecurityOptions>
    {
        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {            
            string authorization = Request.Headers["Authorization"];
            if(string.IsNullOrEmpty(authorization))
            {
                return AuthenticateResult.Skip();
            }

            string key = null;
            if(authorization.StartsWith("lousysecurity ", StringComparison.OrdinalIgnoreCase))
            {
                key = authorization.Substring("lousysecurity ".Length).Trim();
            }
            else 
            {
                return AuthenticateResult.Skip();
            }

            try 
            {
                var keyGuid = new Guid(key);
                var player = await Options.DbContext.Players.SingleOrDefaultAsync(x => x.LousySecurityKey == keyGuid);

                if(player != null) 
                {
                    var principal = new ClaimsPrincipal(new ClaimsIdentity(CreatePlayerClaims(player), Options.AuthenticationScheme));
                    return AuthenticateResult.Success(new AuthenticationTicket(principal, new AuthenticationProperties(), Options.AuthenticationScheme));
                }

                return AuthenticateResult.Fail("No such user");
            }
            catch(Exception ex)
            {
                return AuthenticateResult.Fail(ex);
            }
        }

        private IEnumerable<Claim> CreatePlayerClaims(Player player)
        {
            var list = new List<Claim>();
            list.Add(new Claim(ClaimTypes.NameIdentifier, player.Id.ToString()));
            list.Add(new Claim(ClaimTypes.Name, player.Nickname));
            return list;
        }
    }

    public class LousySecurityOptions : AuthenticationOptions 
    {
        public LousySecurityOptions() : base()
        {
            AuthenticationScheme = "lousysecurity";
            AutomaticAuthenticate = true;
            AutomaticChallenge = true;
        }

        public BbbgContext DbContext { get; set; }
    }
}