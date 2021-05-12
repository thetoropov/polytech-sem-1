from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/hw1')
def hw1():
    return render_template('hw1.html')


@app.route('/hw2')
def hw2():
    return render_template('hw2.html')


@app.route('/hw3')
def hw3():
    return render_template('hw3.html')


@app.route('/hw4')
def hw4():
    return render_template('hw4.html')


@app.route('/hw5')
def hw5():
    return render_template('hw5.html')


if __name__ == '__main__':
    app.run()
