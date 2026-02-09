import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const coupons = [
    {
      title: "Massages on Demand 💆‍♂️",
      description: "Redeem for a 30-minute relaxing massage whenever needed.",
      category: "Relaxation",
      redemptionLimit: 3,
    },
    {
      title: "Movie Night Choice 🎬",
      description: "You pick the movie, the snacks, and the blanket setup.",
      category: "Entertainment",
    },
    {
      title: "Breakfast in Bed 🥞",
      description: "Stay cozy while I whip up your favorite morning treat.",
      category: "Food",
    },
    {
      title: "Dinner Date Night 🍷",
      description: "A romantic dinner out (or in!) at your favorite spot.",
      category: "Date",
    },
     {
      title: "Tech-Free Evening 📵",
      description: "No phones, just us. Quality time guaranteed.",
      category: "Time",
    },
    {
      title: "Homemade Dessert 🍰",
      description: "I'll bake (or buy 😉) your favorite sweet treat.",
      category: "Food",
    },
    {
      title: "Adventure Day 🗺️",
      description: "We go somewhere new or do something we've never done before.",
      category: "Activity",
    },
    {
      title: "Yes Day (Within Reason) ✅",
      description: "I say yes to your requests for a whole day (T&Cs apply!).",
      category: "Special",
    },
  ]

  console.log("Seeding database...")

  for (const coupon of coupons) {
    await prisma.coupon.create({
      data: {
        title: coupon.title,
        description: coupon.description,
        category: coupon.category,
        redemptionLimit: coupon.redemptionLimit,
      }
    })
  }

  console.log("Seeding finished.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
