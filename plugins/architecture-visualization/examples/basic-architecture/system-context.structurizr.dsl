workspace "Order Platform" "Example architecture source for the Architecture plugin." {
  model {
    customer = person "Customer" "Places and tracks orders."
    support = person "Support Agent" "Reviews order state and customer issues."

    orderSystem = softwareSystem "Order Platform" "Accepts orders, takes payment, and coordinates fulfillment." {
      web = container "Web App" "Customer ordering experience." "TypeScript / React"
      api = container "Order API" "Owns order commands and status queries." "Node.js"
      ordersDb = container "Orders Database" "Stores orders, payments, and fulfillment status." "PostgreSQL"
      events = container "Order Events" "Publishes order lifecycle events." "Kafka"
      worker = container "Fulfillment Worker" "Coordinates warehouse fulfillment." "Node.js worker"

      web -> api "Places orders and reads order status" "HTTPS / JSON"
      api -> ordersDb "Reads and writes order state" "SQL"
      api -> events "Publishes OrderPlaced" "Kafka"
      worker -> events "Consumes OrderPlaced" "Kafka"
      worker -> ordersDb "Updates fulfillment status" "SQL"
    }

    payment = softwareSystem "Payment Gateway" "Authorizes payments."
    warehouse = softwareSystem "Warehouse System" "Receives fulfillment requests."

    customer -> orderSystem "Places and tracks orders"
    support -> orderSystem "Reviews order status"
    orderSystem -> payment "Authorizes payments" "HTTPS"
    orderSystem -> warehouse "Sends fulfillment requests" "Events"
  }

  views {
    systemContext orderSystem "order-context" {
      include *
      autolayout lr
    }

    container orderSystem "order-containers" {
      include *
      autolayout lr
    }

    theme default
  }
}
