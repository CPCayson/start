from flask import render_template
from app import db
from app.errors import blueprint


@blueprint.route('/404')
def four():
    return render_template('404.html')

@blueprint.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@blueprint.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500