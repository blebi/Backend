import { SSEListener } from "./sseListener.js";

export class NotificationListener {
  constructor() {
    new SSEListener("notification", (event: MessageEvent<any>) => {
      this.sendNotification(event.data);
    });
  }

  private sendNotification(message: string) {

    var notification = $('<div>', {
      class: 'col-12 notification'
    }).text(message).hide().appendTo($(".notifications")).show("fast");

    setTimeout(function () {
      $(notification).hide("slow", function () {
        $(notification).remove();
      });
    }, 5000);
  }
}

