from flask import render_template
from app import app, db
from app.errors import blueprint

@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404

@blueprint.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500



@blueprint.route('/404')
def four():
    return render_template('chopsticks.html')