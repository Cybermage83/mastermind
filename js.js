(function() {
    'use strict';
    var Mastermind = function() {
        this.newGame();
    };

    Mastermind.prototype = {
        secretCode: [],
        constant: {
            count: '<p>Guess #<span id="count">0</span>!</p>'
        },
        dom: {
            selector: '#peg-selector',
            selected: '#selection',
            guess: '#guessButton',
            guessCount: '#count',
            guessList: '#guessList',
            guessText: '#guess',
            newGame: '#newGame',
            gameLost: '#gameLost',
            gameWon: '#gameWon',
            cheat: '#cheat',
            secret: '#secret'
        },

        gameState: {
            newGame: true,
            gameOver: false,
            win: null,
            picks: 0,
            guesses: 0,
            maxTries: 12,
            maxPick: 5,
            userPick: [],
            colors: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'black']
        },

        codeGenerator: function() {
            var _this = this;
            _this.secretCode = [];
            for (var i = 0, l = _this.gameState.maxPick; i < l; i += 1) {
                var index = Math.floor((Math.random() * _this.gameState.colors.length));
                _this.secretCode.push(_this.gameState.colors[index]);
            }
        },

        newGame: function() {
            var _this = this;
            if (!_this.gameState.newGame) {
                return false;
            }

            _this.codeGenerator();
            _this.selection();
            _this.guesser();
            _this.reset();
            _this.cheat();
        },

        selection: function() {
            var _this = this,
                domPegSelector = _this.dom.selector,
                domPegSelected = _this.dom.selected;

            $(domPegSelector).find('li').on('click', function() {
                var select = _this.gameState.userPick;
                var gameover = _this.gameState.gameOver;
                if (gameover) {
                    return;
                }

                if ($(domPegSelected).find('li').size() + 1 > _this.gameState.maxPick) {
                    return false;
                }

                var el = $(this).clone();
                select.push(el.attr('class'));
                $(domPegSelected).append(el);

            });
        },

        gameLogic: function(callback) {
            var _this = this,
                userPick = _this.gameState.userPick,
                secretCode = _this.secretCode,
                guess = '',
                guessBuild = [],
                colorCheck = [];

            _.reduce(secretCode, function(mem, val, ind) {

                for (var i = 0, l = userPick.length; i < l; i += 1) {
                    //console.log(userPick[i],val, ind, i)
                    if (userPick[i] === val && ind === i) {
                        guess = 'red';
                        colorCheck.push(val);
                    }
                }
                if (guess) {
                    guessBuild.push(guess);
                    guess = '';
                }
            }, []);

            _.reduce(secretCode, function(mem, val, i) {

                for (var d = 0, l = userPick.length; d < l; d += 1) {
                    //console.log(userPick[i],val, ind, i)
                    var whiteCheck = _.filter(secretCode, function(secret) {
                        return secret === userPick[i];
                    });

                    if (whiteCheck.length > 0) {
                        var whiteColor = whiteCheck[0];

                        if (colorCheck.length > 0) {
                            var whiteColorCheck = _.filter(colorCheck, function(color) {
                                return color === whiteColor;
                            });

                            if (whiteColorCheck.length === 0) {
                                guess = 'white';
                            }
                        } else {
                            guess = 'white';
                        }

                    }
                }

                if (guess) {
                    guessBuild.push(guess);
                    guess = '';
                }
            }, []);
            
            callback(guessBuild);
            guessBuild = [];
        },

        guesser: function() {
            var _this = this,
                button = _this.dom.guess,
                counter = _this.dom.guessCount,
                guessCount = _this.gameState.guesses;

            $(button).on('click', function(el) {
                el.preventDefault();
                _this.gameState.guesses += 1;
                _this.checkGame();
                $(counter).html(_this.gameState.guesses);

                _this.gameLogic(function(response) {
                    _this.guessList(response);
                    _this.gameState.userPick = [];
                });
            });

        },

        guessList: function(guesses) {
            var _this = this,
                userPick = _this.dom.selected,
                userSelected = _this.gameState.userPick,
                listDisplay = _this.dom.guessList,
                guessList = $('<ul class="box"></ul>');

            var clonePick = $(userPick).clone();
            $(userPick).html('');

            var li = $('<li></li>').append(clonePick);
            $.each(guesses, function(i) {
                $('<li/>').addClass(guesses[i]).appendTo(guessList);
            });
            li.append(guessList);
            $(listDisplay).prepend(li);
        },

        reset: function() {
            var _this = this,
                newGame = _this.dom.newGame,
                gameWon = _this.dom.gameWon,
                gameLost = _this.dom.gameLost,
                button = _this.dom.guess,
                counter = _this.dom.guessCount,
                guessText = _this.dom.guessText,
                guessList = _this.dom.guessList,
                secretClean = _this.dom.secret;

            $(newGame).on('click', function() {
                _this.codeGenerator();
                _this.gameState.guesses = 0;
                _this.gameState.gameOver = false;

                $(counter).html(_this.gameState.guesses);
                $(guessText).show();
                $(button).show();

                if ($(gameWon + ':visible')) {
                    $(gameWon).hide();
                }
                if ($(gameLost + ':visible')) {
                    $(gameLost).hide();
                }
                $(guessList).html('');
                $(secretClean).html('');
            });
        },

        checkGame: function() {
            var _this = this,
                gueses = _this.gameState.guesses,
                maxTries = _this.gameState.maxTries,
                guessText = _this.dom.guessText,
                button = _this.dom.guess,
                gameOver = _this.gameState.gameOver;

            if (gueses > maxTries) {
                $(guessText).hide();
                $('#gameLost').show();
                _this.gameState.gameOver = true;
                $(button).hide();
            }

            var win = _.filter(_this.secretCode, function(secret, ind) {
                return secret == _this.gameState.userPick[ind];
            });

            if (win.length === _this.gameState.maxPick) {
                $(guessText).hide();
                $('#gameWon').show();
                _this.gameState.gameOver = true;
                $(button).hide();
            }
        },
        cheat: function() {
            var _this = this,
                cheat = _this.dom.cheat,
                secret = _this.dom.secret;

            $(cheat).on('click', function() {
                var ul = $('<ul class="circle cheat"></ul>'),
                    secretCode = _this.secretCode,
                    secretDom = $(secret);

                $.each(secretCode, function(i) {
                    $('<li/>').addClass(secretCode[i]).appendTo(ul);
                });
                secretDom.append(ul);
                secretDom.show();
            });
        }
    };

    $(document).ready(function() {
        var newGame = new Mastermind({});
    });
})();
