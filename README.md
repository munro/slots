# Slots — An event emitter with slots!

Slots does just that, it provides slots for your event emitter bonds!  There is
also a SlotManager for combining your slots from different emitters, giving you
a single interface for wrangling all your bonds.

A slot is an object that holds the bond between a callback, and an event emitter.
This is convenient because you can just tell the slot to disconnect, without
having to remember both parts of the bond.

## Documentation

## Examples

## With a state graph

With socket.io, one usually only wants a user to be able to perform an action
in a certain state.  Such as being able to kick other players if they are the
host of the game.  With Slots— you can simply remove the event callback for
players who aren't host, as opposed to writing logic instead the callback to
verify the player's state.

A great way to handle 'state' is with a state graph.  It keeps your code simple,
and your state isolated.  Below is some pseudo-code to illustrate my example of
hosts only being able to click players:

    function Player(socket, game, isHost) {
        var graph = new StateGraph();

        graph.state('host', function (state) {
            // When the player enters the host state, bind the kick event
            state.slot = socket.on('kick', function (player) {
                game.kick(player);
            });
        }).on('end', function (state) {
            // Disconnect the kick event when the player is no longer a host
            state.slot.remove();
        });

        graph.state('player', function () {
            // Poor players... they can't do anything!
        });

        if (isHost) {
            graph.go('host');
        } else {
            graph.go('player');
        }

        return {
            host: function () {
                graph.go('host');
            },
            player: function () {
                graph.go('player');
            }
        };
    }
