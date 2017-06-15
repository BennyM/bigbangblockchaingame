using api.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using api.Util;
using Hangfire;
using api.Jobs;
using Nethereum.Web3;
using Hangfire.Dashboard;
using Hangfire.Annotations;
using System;

namespace api
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddDbContext<BbbgContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")), ServiceLifetime.Transient);

            services.AddCors();
            services.AddMvc();
            services.Configure<EthereumSettings>(Configuration.GetSection("Ethereum"));

             services.AddHangfire(config => config.UseSqlServerStorage(Configuration.GetConnectionString("DefaultConnection")));
    
            services.AddTransient<CreateGameAddressJob>();
            services.AddTransient<PollForDrawJob>();
            services.AddTransient<WinnerPollJob>();
             services.AddTransient<PollForRevealHandJob>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseCors(builder => 
                builder.WithOrigins(Configuration["Deployment:ui-origin"])
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials());
            app.UseLousySecurity();

            app.UseMvc();

            app.UseHangfireDashboard("/nothangfire", new DashboardOptions
            {
                Authorization = new [] { new CustomDashboardAuthorizationFilter() }
            });
            app.UseHangfireServer();

            app.ApplicationServices.GetService<BbbgContext>().Database.Migrate();
            CreateGameAddressJob j = new CreateGameAddressJob(null,null);
            RecurringJob.AddOrUpdate(() => j.PollForAddress(), Cron.Minutely);
        }
    }

    public class CustomDashboardAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize([NotNull] DashboardContext context)
        {
            return true;
        }
    }
}
