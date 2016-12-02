using System;
using System.Configuration;
using System.Web.Mvc;

namespace BigBangBlockchainGame.Controllers
{
    public class HomeController : Controller
    {
        [Authorize]
        public ActionResult Index()
        {
            var gamelobbyAddress = ConfigurationManager.AppSettings["gamelobbyAddress"];
            var blockchainUrl = ConfigurationManager.AppSettings["blockchainUrl"];

            return View(Tuple.Create(gamelobbyAddress, blockchainUrl));
        }
    }
}