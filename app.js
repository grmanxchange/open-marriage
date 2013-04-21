var express = require('express'),
    exphbs  = require('express3-handlebars'),

    config     = require('./config'),
    helpers    = require('./lib/helpers'),
    middleware = require('./middleware'),
    routes     = require('./routes'),

    app = express();

// -- Configure ----------------------------------------------------------------

app.set('name', 'Leslie-Eric Wedding');
app.set('env', config.env);
app.set('port', config.port);
app.set('views', config.dirs.views);
app.set('view engine', 'hbs');

app.enable('strict routing');

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname      : '.hbs',
    helpers      : helpers,
    layoutsDir   : config.dirs.layouts,
    partialsDir  : config.dirs.partials
}));

app.locals({
    title: 'Leslie & Eric',

    nav: [
        {id: 'wedding',   url: '/wedding/',   label: 'Wedding'},
        {id: 'logistics', url: '/logistics/', label: 'logistics'}
    ],

    subnav: {
        logistics: [
            {id: 'logistics', url: '/logistics/',         label: 'Logistics'},
            {id: 'hotels',    url: '/logistics/hotels/',  label: 'Hotels'},
            {id: 'outings',   url: '/logistics/outings/', label: 'Outings'}
        ]
    },

    version: config.version,

    pictos : config.pictos,
    typekit: config.typekit,
    yui    : config.yui,

    isDevelopment: config.isDevelopment,
    isProduction : config.isProduction,

    min: config.isProduction ? '-min' : ''
});

// -- Middleware ---------------------------------------------------------------

if (config.isDevelopment) {
    app.use(express.logger('tiny'));
}

app.use(express.compress());
app.use(express.favicon(config.dirs.pub + '/favicon.ico'));
app.use(express.cookieParser());
app.use(express.cookieSession({secret: config.secrets.session}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.csrf());
app.use(app.router);
app.use(middleware.slash());
app.use(express.static(config.dirs.pub));
app.use(middleware.errors.notfound);

if (config.isDevelopment) {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack     : true
    }));
} else {
    app.use(middleware.errors.server);
}

// -- Routes -------------------------------------------------------------------

app.get('/', routes.render('home'));

app.get('/wedding/', routes.render('wedding'));

app.get('/logistics/',         routes.render('logistics'));
app.get('/logistics/hotels/',  routes.render('logistics/hotels'));
app.get('/logistics/outings/', routes.render('logistics/outings'));

app.get('/rsvp/',            routes.rsvp.edit);
app.get('/rsvp/:invitation', routes.rsvp.login);

app.all('/invitations/:invitation/', middleware.auth.ensureInvitation);
app.get('/invitations/:invitation/', routes.invitations.read);
app.put('/invitations/:invitation/', routes.invitations.update);

app.get('/combo/:version', routes.combo);

module.exports = app;
