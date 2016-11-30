using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BigBangBlockchainGame.Startup))]
namespace BigBangBlockchainGame
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
