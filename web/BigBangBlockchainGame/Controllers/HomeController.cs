using System.Web.Mvc;

namespace BigBangBlockchainGame.Controllers
{
    public class HomeController : Controller
    {
       [Authorize]
        public ActionResult Index()
        {
            return View();
        }
    }
}