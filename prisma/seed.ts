import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

// Use unique ids to avoid conflict with existing categories from other projects
const categories = [
  { id: "ecom-uncategorized", name: "Uncategorized", slug: "uncategorized" },
  { id: "ecom-featured", name: "Featured", slug: "featured" },
];

async function main() {
  const adminPasswordHash = await hash(ADMIN_PASSWORD, 12);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminPasswordHash, role: "ADMIN", emailVerified: new Date() },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Seeded admin user");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("Seeded categories");

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderCents: null,
      expiresAt: null,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE5" },
    update: {},
    create: {
      code: "SAVE5",
      type: "FIXED",
      value: 500,
      minOrderCents: 3000,
      expiresAt: null,
    },
  });
  console.log("Seeded coupons: WELCOME10, SAVE5");

  // Blog categories and articles
  try {
    const blogCatIds = ["blogcat-1", "blogcat-2", "blogcat-3"];
    await prisma.blogCategory.upsert({
      where: { id: blogCatIds[0] },
      update: { name: "Tutorials", slug: "tutorials" },
      create: { id: blogCatIds[0], name: "Tutorials", slug: "tutorials" },
    });
    await prisma.blogCategory.upsert({
      where: { id: blogCatIds[1] },
      update: { name: "Inspiration", slug: "inspiration" },
      create: { id: blogCatIds[1], name: "Inspiration", slug: "inspiration" },
    });
    await prisma.blogCategory.upsert({
      where: { id: blogCatIds[2] },
      update: { name: "Materials", slug: "materials" },
      create: { id: blogCatIds[2], name: "Materials", slug: "materials" },
    });

    const blogPosts = [
      {
        slug: "beginners-guide-to-knitting",
        title: "A Beginner's Guide to Knitting: Everything You Need to Start",
        excerpt: "New to knitting? This comprehensive guide walks you through choosing your first yarn, picking the right needles, and mastering the basic stitches every knitter should know.",
        body: `<p>Knitting is one of the most rewarding crafts you can learn. With just two needles and a ball of yarn, you can create everything from cozy scarves to intricate sweaters. If you've never picked up knitting needles before, this guide will help you get started with confidence.</p>
<h2>Choosing Your First Yarn</h2>
<p>For beginners, we recommend starting with a medium-weight (worsted) yarn in a light color. Light colors make it easier to see your stitches as you learn. Our <strong>Superwash Merino Worsted</strong> is an excellent choice — it's forgiving, easy to work with, and comes in beautiful colors.</p>
<h2>Picking the Right Needles</h2>
<p>Bamboo needles are ideal for beginners because they have a slight grip that prevents stitches from sliding off. Our <strong>Bamboo Knitting Needles Set</strong> gives you a full range of sizes so you're prepared for any project. Start with size 5mm or 6mm needles for your first project.</p>
<h2>The Two Essential Stitches</h2>
<p>Every knitting pattern is built from just two stitches: the <strong>knit stitch</strong> and the <strong>purl stitch</strong>. Master these two, and you can create virtually any knitted fabric.</p>
<h3>The Knit Stitch</h3>
<p>Insert your right needle from left to right through the first stitch on your left needle. Wrap the yarn around the right needle and pull it through. Slide the old stitch off the left needle. That's it!</p>
<h3>The Purl Stitch</h3>
<p>The purl is essentially the reverse of a knit stitch. Insert your right needle from right to left, wrap the yarn, and pull through.</p>
<h2>Your First Project: A Simple Scarf</h2>
<p>Cast on 30 stitches and knit every row (this creates "garter stitch"). Continue until your scarf is the desired length, then bind off. It's that simple — and you'll have a beautiful handmade scarf to show for it.</p>`,
        image: "/images/blog/beginner-knitting.png",
        authorName: "Sarah Mitchell",
        categoryId: blogCatIds[0],
        publishedAt: new Date("2026-02-15"),
      },
      {
        slug: "art-of-hand-dyeing-yarn",
        title: "The Art of Hand-Dyeing Yarn: How Artisan Colors Are Made",
        excerpt: "Ever wondered how those gorgeous variegated yarns get their color? We take you behind the scenes of hand-dyeing, from fiber preparation to the final twist.",
        body: `<p>There's something magical about hand-dyed yarn. Each skein tells a story — the colors blending and shifting in ways that machine-dyed yarn simply can't replicate. But how do artisan dyers create these stunning colorways?</p>
<h2>The Dyeing Process</h2>
<p>Hand-dyeing begins with undyed yarn, often called "bare" or "natural" yarn. The fiber is first soaked in a mordant solution (usually citric acid for protein fibers like wool) to help the dye bond permanently to the fibers.</p>
<h2>Techniques That Create Unique Effects</h2>
<p><strong>Kettle dyeing</strong> produces subtle, semi-solid colorways with gentle tonal variations. The yarn simmers in a dye bath, and natural variations in how the yarn absorbs color create a rich, organic look.</p>
<p><strong>Hand-painting</strong> is where the dyer applies different colors directly to sections of the yarn using squeeze bottles, brushes, or even spoons. This creates bold, multi-colored yarns like our <strong>Hand-Dyed Sock Yarn in Ocean Blues</strong>.</p>
<p><strong>Speckle dyeing</strong> creates playful confetti-like dots of color across a base shade. The dyer flicks or sprinkles concentrated dye onto the yarn for a festive, modern look.</p>
<h2>Why Hand-Dyed Yarn Is Special</h2>
<p>Because each skein is dyed individually, no two are exactly alike. This uniqueness is part of the charm — when you knit or crochet with hand-dyed yarn, your finished piece is truly one of a kind.</p>`,
        image: "/images/blog/hand-dyeing-yarn.png",
        authorName: "Emma Rodriguez",
        categoryId: blogCatIds[2],
        publishedAt: new Date("2026-02-22"),
      },
      {
        slug: "cozy-crochet-blanket-weekend",
        title: "Weekend Project: A Cozy Crochet Blanket in Just Two Days",
        excerpt: "Looking for a satisfying weekend project? This chunky crochet blanket works up fast and makes the perfect gift — or treat for yourself.",
        body: `<p>Sometimes you want a project that delivers quick results without sacrificing beauty. This chunky crochet blanket is designed to be completed in a single weekend, using super bulky yarn and a large hook for speedy stitching.</p>
<h2>What You'll Need</h2>
<ul>
<li>6-8 skeins of super bulky yarn (we love our <strong>Merino Wool Chunky</strong> for this)</li>
<li>12mm crochet hook</li>
<li>Yarn needle for weaving in ends</li>
<li>Scissors</li>
</ul>
<h2>The Pattern</h2>
<p>Chain 80 stitches (or desired width). Work in half double crochet across each row, chaining 2 at the beginning of each row to turn. That's the entire pattern — beautifully simple.</p>
<h2>Tips for a Professional Finish</h2>
<p>Keep your tension consistent throughout the project. If you tend to crochet tightly when you're focused and loosely when you're relaxed, try to be mindful of your gauge.</p>
<p>When changing skeins, join the new yarn at the beginning of a row rather than in the middle. This keeps your edges neat and makes weaving in ends easier.</p>
<h2>Finishing Touches</h2>
<p>Once your blanket reaches the desired length, add a simple single crochet border all around for a polished edge. Weave in all ends, give it a gentle block, and you're done!</p>`,
        image: "/images/blog/crochet-blanket.png",
        authorName: "Sarah Mitchell",
        categoryId: blogCatIds[0],
        publishedAt: new Date("2026-03-01"),
      },
      {
        slug: "embroidery-floral-designs",
        title: "5 Floral Embroidery Designs Perfect for Spring",
        excerpt: "Bring the beauty of spring indoors with these five stunning floral embroidery patterns, from simple daisies to elaborate rose wreaths.",
        body: `<p>Spring is the perfect time to pick up your embroidery hoop and stitch something beautiful. These five floral designs range from beginner-friendly to advanced, so there's something for every skill level.</p>
<h2>1. Simple Daisy Chain</h2>
<p>Using just lazy daisy stitch and French knots, create a charming chain of daisies around your hoop. This is an ideal first project if you're new to embroidery. Our <strong>Embroidery Starter Kit</strong> includes everything you need to get started.</p>
<h2>2. Lavender Sprigs</h2>
<p>Straight stitches in graduating shades of purple create realistic lavender stems. Group three to five sprigs together and tie them with a satin stitch bow for a sweet, country-inspired design.</p>
<h2>3. Wildflower Meadow</h2>
<p>Combine multiple stitch types — French knots for baby's breath, lazy daisies for wildflowers, and stem stitch for grasses — to create a lush meadow scene at the bottom of your hoop.</p>
<h2>4. Rose Wreath</h2>
<p>Woven wheel roses in various sizes arranged in a circular wreath make a stunning centerpiece. Try our <strong>Floral Wreath Cross Stitch Kit</strong> for a guided version of this classic design.</p>
<h2>5. Botanical Study</h2>
<p>For advanced stitchers, a detailed botanical illustration of a single flower species — complete with leaves, stems, and seeds — makes a sophisticated piece worthy of framing.</p>`,
        image: "/images/blog/embroidery-flowers.png",
        authorName: "Lily Chen",
        categoryId: blogCatIds[1],
        publishedAt: new Date("2026-03-03"),
      },
      {
        slug: "guide-to-sustainable-fibers",
        title: "A Crafter's Guide to Sustainable and Eco-Friendly Fibers",
        excerpt: "Make conscious choices in your crafting with this guide to sustainable yarn fibers, from organic cotton to recycled materials.",
        body: `<p>As crafters, we have the power to make environmentally conscious choices with every project we create. Understanding the sustainability of different fibers helps us make informed decisions that align with our values.</p>
<h2>Organic Cotton</h2>
<p>Grown without synthetic pesticides or fertilizers, organic cotton is a wonderful choice for baby items, kitchen textiles, and summer garments. Our <strong>Paintbox Cotton DK</strong> is responsibly sourced and biodegradable.</p>
<h2>Alpaca</h2>
<p>Alpaca fiber is naturally sustainable. Alpacas have a low environmental footprint — they graze gently without destroying root systems and produce enough fleece for several garments each year. Our <strong>Alpaca Blend DK</strong> showcases the natural, undyed beauty of this fiber.</p>
<h2>Bamboo</h2>
<p>Bamboo grows rapidly without pesticides and requires minimal water. Bamboo fiber is silky soft, naturally antibacterial, and has excellent drape. It's perfect for lightweight shawls and summer tops.</p>
<h2>Recycled Fibers</h2>
<p>Some innovative yarn companies are now creating beautiful yarns from recycled plastic bottles, repurposed factory scraps, and reclaimed garments. These yarns reduce waste while delivering excellent quality.</p>
<h2>Wool and Animal Fibers</h2>
<p>When sourced from farms with ethical practices, wool is one of the most sustainable fibers available. It's renewable, biodegradable, naturally flame-resistant, and incredibly long-lasting. Look for certifications like RWS (Responsible Wool Standard) when choosing your yarn.</p>`,
        image: "/images/blog/sustainable-fibers.png",
        authorName: "Emma Rodriguez",
        categoryId: blogCatIds[2],
        publishedAt: new Date("2026-03-05"),
      },
      {
        slug: "macrame-wall-hanging-tutorial",
        title: "Create a Stunning Macrame Wall Hanging: Step-by-Step Tutorial",
        excerpt: "Transform simple cotton cord into a beautiful boho wall hanging with this beginner-friendly macrame tutorial featuring just three basic knots.",
        body: `<p>Macrame has made a spectacular comeback in home decor, and for good reason. With just a few basic knots, you can create stunning wall hangings, plant hangers, and decorative pieces that add warmth and texture to any room.</p>
<h2>Materials</h2>
<ul>
<li>Our <strong>Natural Cotton Macrame Cord Bundle</strong> (5mm thickness is ideal for wall hangings)</li>
<li>A wooden dowel or driftwood piece (30-40cm long)</li>
<li>Scissors</li>
<li>Measuring tape</li>
<li>A comb for fringing</li>
</ul>
<h2>The Three Knots You Need</h2>
<h3>Lark's Head Knot</h3>
<p>This is how you attach your cords to the dowel. Fold a cord in half, place the loop over the dowel from front to back, then pull the cord ends through the loop and tighten.</p>
<h3>Square Knot</h3>
<p>Using four cords, cross the left cord over the two middle cords and under the right cord. Then cross the right cord under the middle cords and through the left loop. Repeat from the other side to complete one square knot.</p>
<h3>Spiral Knot</h3>
<p>A spiral knot is simply a half square knot repeated — always starting from the same side. The cords will naturally twist into a beautiful spiral pattern.</p>
<h2>Putting It Together</h2>
<p>Cut 16 cords, each about 2 meters long. Attach them to your dowel with lark's head knots. Create rows of alternating square knots, leaving gaps for a flowing, organic design. Finish with a diagonal pattern and trim the ends at an angle for a modern look.</p>`,
        image: "/images/blog/macrame-wall-hanging.png",
        authorName: "Sarah Mitchell",
        categoryId: blogCatIds[0],
        publishedAt: new Date("2026-03-06"),
      },
    ];

    for (const post of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          image: post.image,
          authorName: post.authorName,
          categoryId: post.categoryId,
          publishedAt: post.publishedAt,
        },
        create: post,
      });
    }

    await prisma.blogPost.deleteMany({
      where: { slug: "welcome-to-our-store" },
    });

    console.log(`Seeded blog categories and ${blogPosts.length} articles`);
  } catch (e: unknown) {
    const err = e as { code?: string; meta?: { modelName?: string } };
    if (err?.code === "P2021" && err?.meta?.modelName === "BlogCategory") {
      console.log(
        "Blog tables not found — run prisma/apply-blog-manually.sql in Supabase SQL Editor, then run 'npx prisma db seed' again to seed blog data."
      );
    } else {
      throw e;
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
